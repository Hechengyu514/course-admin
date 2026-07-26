import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Select, Radio, Empty, Tag } from "antd";
import { useUserStore } from "@/store/userStore";
import { useCourseStore } from "@/store/courseStore";
import { useSemesterStore } from "@/store/semesterStore";
import { useScheduleViewStore } from "@/store/scheduleViewStore";
import { SEMESTERS, WEEKDAYS, PERIODS } from "@/constants";
import type { Course } from "@/types";
import styles from "./ScheduleView.module.css";

/**
 * 课表视图
 *
 * 学生：看自己的选课
 * 教师：看自己的授课
 * 管理员：按教师 / 按教室 查看
 */
export default function ScheduleView() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.currentUser);
  const allUsers = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const semester = useSemesterStore((s) => s.currentSemester);
  const setSemester = useSemesterStore((s) => s.setSemester);

  const viewMode = useScheduleViewStore((s) => s.viewMode);
  const selectedTeacherId = useScheduleViewStore((s) => s.selectedTeacherId);
  const selectedClassroom = useScheduleViewStore((s) => s.selectedClassroom);
  const setViewMode = useScheduleViewStore((s) => s.setViewMode);
  const setSelectedTeacherId = useScheduleViewStore((s) => s.setSelectedTeacherId);
  const setSelectedClassroom = useScheduleViewStore((s) => s.setSelectedClassroom);

  useEffect(() => {
    fetchCourses();
    if (user?.role === "admin") fetchUsers();
  }, [fetchCourses, fetchUsers, user]);

  const classrooms = useMemo(() => {
    const set = new Set(courses.map((c) => c.classroom));
    return Array.from(set).sort();
  }, [courses]);

  const teachers = useMemo(
    () => allUsers.filter((u) => u.role === "teacher"),
    [allUsers],
  );

  // ===== 课程过滤 =====（user 为 null 时返回空数组）
  const myCourses = useMemo(() => {
    if (!user) return [];
    const semesterCourses = courses.filter((c) => c.semester === semester);

    if (user.role === "admin") {
      if (viewMode === "teacher" && selectedTeacherId) {
        return semesterCourses.filter((c) => c.teacherId === selectedTeacherId);
      }
      if (viewMode === "classroom" && selectedClassroom) {
        return semesterCourses.filter((c) => c.classroom === selectedClassroom);
      }
      return [];
    }

    if (user.role === "teacher") {
      return semesterCourses.filter((c) => c.teacherId === user.id);
    }

    return semesterCourses.filter((c) => c.studentIds.includes(user.id));
  }, [courses, semester, user, viewMode, selectedTeacherId, selectedClassroom]);

  // ===== 按 grid cell 分组 =====
  type GridCell = { day: number; start: number; rowStart: number; rowEnd: number; courses: Course[] };
  const gridCells = useMemo(() => {
    const map = new Map<string, GridCell>();
    myCourses.forEach((c) => {
      c.timeSlots.forEach((slot) => {
        const key = `${slot.day}-${slot.start}`;
        const existing = map.get(key);
        if (existing) {
          if (!existing.courses.includes(c)) existing.courses.push(c);
        } else {
          map.set(key, {
            day: slot.day, start: slot.start,
            rowStart: slot.start + 1, rowEnd: slot.start + slot.duration + 1,
            courses: [c],
          });
        }
      });
    });
    return Array.from(map.values());
  }, [myCourses]);

  const subTitle = useMemo(() => {
    if (!user || user.role !== "admin") return "";
    if (viewMode === "teacher" && selectedTeacherId) {
      const t = teachers.find((t) => t.id === selectedTeacherId);
      return t ? ` — ${t.name}` : "";
    }
    if (viewMode === "classroom" && selectedClassroom) {
      return ` — ${selectedClassroom}`;
    }
    return "";
  }, [user, viewMode, selectedTeacherId, selectedClassroom, teachers]);

  // 等待 store hydration，避免 user 为 null 时渲染
  if (!user) return null;

  // ===== 标题 =====
  const titleExtra = (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {user.role === "admin" && (
        <Radio.Group
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          optionType="button" size="small"
        >
          <Radio.Button value="teacher">按教师</Radio.Button>
          <Radio.Button value="classroom">按教室</Radio.Button>
        </Radio.Group>
      )}
      {user.role === "admin" && viewMode === "teacher" && (
        <Select placeholder="选择教师" value={selectedTeacherId}
          onChange={setSelectedTeacherId} style={{ width: 130 }} size="small"
          options={teachers.map((t) => ({ value: t.id, label: t.name }))} />
      )}
      {user.role === "admin" && viewMode === "classroom" && (
        <Select placeholder="选择教室" value={selectedClassroom}
          onChange={setSelectedClassroom} style={{ width: 150 }} size="small"
          options={classrooms.map((r) => ({ value: r, label: r }))} />
      )}
      <Select value={semester} onChange={setSemester} size="small" style={{ width: 170 }}
        options={SEMESTERS.map((s) => ({ value: s, label: s }))} />
    </div>
  );

  return (
    <Card title={`课表视图${subTitle}`} extra={titleExtra}>
      {myCourses.length === 0 ? (
        <Empty
          description={user.role === "admin" ? "请选择查看条件（教师 / 教室）" : "本学期暂无课程"}
          style={{ padding: 40 }}
        />
      ) : (
        <div className={styles.grid}>
          <div className={styles.corner} />
          {WEEKDAYS.map((d) => (
            <div key={d} className={styles.header}>{d}</div>
          ))}
          {PERIODS.map((p) => (
            <div key={p} className={styles.period} style={{ gridColumn: 1, gridRow: p + 1 }}>{p}</div>
          ))}
          {gridCells.map((cell) => (
            <div
              key={`${cell.day}-${cell.start}`}
              className={styles.cell}
              style={{ gridColumn: cell.day + 1, gridRow: `${cell.rowStart} / ${cell.rowEnd}` }}
            >
              {cell.courses.map((c) => (
                <div key={c.id} className={styles.courseBlock}
                  onClick={() => navigate(`/courses/${c.id}`)}>
                  <div className={styles.courseName}>{c.name}</div>
                  <div className={styles.courseRoom}>
                    {c.classroom}
                    {c.timeSlots.some((s) => s.startWeek > 1 || s.endWeek < 16) && (
                      <Tag color="orange" style={{ fontSize: 10, marginLeft: 4, lineHeight: "14px", padding: "0 3px" }}>
                        {c.timeSlots.map((s) => `${s.startWeek}-${s.endWeek}周`).join(" ")}
                      </Tag>
                    )}
                  </div>
                </div>
              ))}
              {cell.courses.length > 1 && (
                <div className={styles.courseCount}>×{cell.courses.length}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
