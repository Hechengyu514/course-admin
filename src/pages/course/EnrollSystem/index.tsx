import { Button, Card, Col, Input, Row, Space, Tag, App, Alert } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { formatTimeSlots } from "@/utils/formatTimeSlots";
import { hasConflict } from "@/utils/timeConflict";
import { useSemesterStore } from "@/store/semesterStore";
import { useSettingsStore } from "@/store/settingsStore";
import { debounce } from "@/utils/debounce";

/**
 * 选课系统（学生端）
 *
 * 展示本学期可选课程卡片，支持搜索和学期切换。
 * 自动检测时间冲突和学分上限，防止无效选课。
 */

export default function EnrollSystem() {
  const { message } = App.useApp();
  const [keyword, setKeyword] = useState("");
  const debouncedSetKeyword = useMemo(
    () => debounce((v: string) => setKeyword(v), 300),
    [],
  );
  const fetchCourses = useCourseStore((s) => s.fetchCourses);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const semester = useSemesterStore((s) => s.currentSemester);
  const maxCredits = useSettingsStore((s) => s.maxCredits);
  const enrollmentStart = useSettingsStore((s) => s.enrollmentStart);
  const enrollmentEnd = useSettingsStore((s) => s.enrollmentEnd);
  const user = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const { enrollCourse, dropCourse } = useCourseStore();

  // 检查当前是否在选课时段内（使用本地日期）
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const isEnrollmentOpen =
    todayStr >= enrollmentStart && todayStr <= enrollmentEnd;

  const enrolledCourses = useMemo(
    () =>
      user
        ? courses.filter(
            (c) => c.semester === semester && c.studentIds.includes(user.id),
          )
        : [],
    [courses, semester, user],
  );
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);

  const data = useMemo(
    () =>
      courses
        .filter((c) => c.semester === semester)
        .filter((c) =>
          c.name.toLowerCase().includes(keyword.toLowerCase().trim()),
        ),
    [courses, keyword, semester],
  );

  // 数据还未恢复完，先不渲染
  if (!user) return null;

  // 判断课程是否可选：时间冲突 / 学分上限 / 已满
  const canEnroll = (id: number) => {
    const c = courses.find((course) => course.id === id);
    if (!c) return { ok: false, label: "课程不存在" };
    if (c.studentIds.includes(user.id)) return { ok: false, label: "退课" };
    if (
      hasConflict(
        c.timeSlots,
        enrolledCourses.flatMap((ec) => ec.timeSlots),
      )
    )
      return { ok: false, label: "时间冲突" };
    if (totalCredits + c.credits > maxCredits)
      return { ok: false, label: "学分已达最大上限" };
    if (c.enrolledCount >= c.capacity) return { ok: false, label: "已满" };
    return { ok: true, label: "选课" };
  };

  const handleEnroll = async (id: number) => {
    if (canEnroll(id).ok) {
      try {
        await enrollCourse(id, user.id);
        message.success("选课成功");
      } catch {
        message.error("选课失败，请重试");
      }
    }
  };

  const handleDrop = async (id: number) => {
    try {
      await dropCourse(id, user.id);
      message.success("退课成功");
    } catch {
      message.error("退课失败，请重试");
    }
  };

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="输入课程名搜索"
          onSearch={debouncedSetKeyword}
          onChange={(e) => {
            if (!e.target.value) setKeyword("");
          }}
          style={{ width: 200 }}
        />
        <Tag color="blue">当前学期：{semester}</Tag>
        <span style={{ color: "#666" }}>
          已选学分：{totalCredits} / {maxCredits}
        </span>
      </Space>
      {!isEnrollmentOpen && (
        <Alert
          title={`选课窗口：${enrollmentStart} ~ ${enrollmentEnd}，当前仅可查看课程`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]}>
        {data.map((c) => (
          <Col key={c.id} span={8}>
            <Card
              title={c.name}
              extra={<Tag color="blue">{c.category}</Tag>}
              actions={[
                c.studentIds.includes(user.id) ? (
                  <Button
                    danger
                    disabled={!isEnrollmentOpen}
                    onClick={() => handleDrop(c.id)}
                  >
                    退课
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    disabled={!isEnrollmentOpen || !canEnroll(c.id).ok}
                    onClick={() => handleEnroll(c.id)}
                  >
                    {isEnrollmentOpen ? canEnroll(c.id).label : "未开放选课"}
                  </Button>
                ),
              ]}
            >
              <p>授课教师: {c.teacherName}</p>
              <p>学分：{c.credits}</p>
              <p>时间：{formatTimeSlots(c.timeSlots)}</p>
              <p>教室：{c.classroom}</p>
              <p>
                已选：{c.studentIds.length}/{c.capacity}人
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
