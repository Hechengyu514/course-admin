import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Select } from "antd";
import { useUserStore } from "@/store/userStore";
import { useCourseStore } from "@/store/courseStore";
import { SEMESTERS, WEEKDAYS, PERIODS } from "@/constants";
import styles from "./ScheduleView.module.css";

/**
 * 课表视图（首页）
 *
 * 时间轴网格布局：周一~周五 × 1~8节。
 * 学生看自己的选课，教师看自己的授课，管理员看全部。
 * 点击课程块跳转课程详情。
 */

export default function ScheduleView() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  const [semester, setSemester] = useState(SEMESTERS[1]);

  const myCourses = useMemo(
    () =>
      courses.filter((c) => {
        if (c.semester !== semester) return false;
        if (user!.role === "admin") return true;
        if (user!.role === "teacher") return c.teacherId === user!.id;
        return c.studentIds.includes(user!.id);
      }),
    [courses, semester, user],
  );

  // 将课程的时间段拍平成 Grid 坐标
  const blocks = useMemo(
    () =>
      myCourses.flatMap((c) =>
        c.timeSlots.map((slot) => ({
          course: c,
          day: slot.day,
          rowStart: slot.start + 1, // +1 跳过头部行
          rowEnd: slot.start + slot.duration + 1,
        })),
      ),
    [myCourses],
  );

  return (
    <Card
      title="课表视图"
      extra={
        <Select
          value={semester}
          onChange={setSemester}
          options={SEMESTERS.map((s) => ({ value: s, label: s }))}
        />
      }
    >
      <div className={styles.grid}>
        <div className={styles.corner} />
        {WEEKDAYS.map((d) => (
          <div key={d} className={styles.header}>
            {d}
          </div>
        ))}
        {PERIODS.map((p) => (
          <div
            key={p}
            className={styles.period}
            style={{ gridColumn: 1, gridRow: p + 1 }}
          >
            {p}
          </div>
        ))}
        {blocks.map((b) => (
          <div
            key={`${b.course.id}-${b.day}-${b.rowStart}`}
            className={styles.cell}
            style={{
              gridColumn: b.day + 1,
              gridRow: `${b.rowStart} / ${b.rowEnd}`,
            }}
            onClick={() => navigate(`/courses/${b.course.id}`)}
          >
            <div className={styles.courseName}>{b.course.name}</div>
            <div className={styles.courseRoom}>{b.course.classroom}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
