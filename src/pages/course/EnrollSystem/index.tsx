import {
  Button, Card, Col, Input, Row, Select, Space, Tag, App,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { formatTimeSlots } from "@/utils/formatTimeSlots";
import { hasConflict } from "@/utils/timeConflict";
import { SEMESTERS, CURRENT_SEMESTER, MAX_CREDITS } from "@/constants";
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
  const debouncedSetKeyword = useMemo(() => debounce((v: string) => setKeyword(v), 300), []);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  const [semester, setSemester] = useState(CURRENT_SEMESTER);
  const user = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const { enrollCourse, dropCourse } = useCourseStore();

  const enrolledCourses = useMemo(
    () =>
      courses.filter(
        (c) => c.semester === semester && c.studentIds.includes(user!.id),
      ),
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

  // 判断课程是否可选：时间冲突 / 学分上限 / 已满
  const canEnroll = (id: number) => {
    const c = courses.find((course) => course.id === id);
    if (!c) return { ok: false, label: "课程不存在" };
    if (c.studentIds.includes(user!.id)) return { ok: false, label: "退课" };
    if (
      hasConflict(
        c.timeSlots,
        enrolledCourses.flatMap((ec) => ec.timeSlots),
      )
    )
      return { ok: false, label: "时间冲突" };
    if (totalCredits + c.credits > MAX_CREDITS)
      return { ok: false, label: "学分已达最大上限" };
    if (c.studentIds.length >= c.capacity) return { ok: false, label: "已满" };
    return { ok: true, label: "选课" };
  };

  const handleEnroll = (id: number) => {
    if (canEnroll(id).ok) {
      enrollCourse(id, user!.id);
      message.success("选课成功");
    }
  };

  const handleDrop = (id: number) => {
    dropCourse(id, user!.id);
    message.success("退课成功");
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
        <Select
          value={semester}
          onChange={setSemester}
          options={SEMESTERS.map((s) => ({ value: s, label: s }))}
          style={{ width: 200 }}
        />
        <span style={{ color: "#666", marginLeft: 8 }}>
          本学期已选：{totalCredits} / {MAX_CREDITS} 学分
        </span>
      </Space>

      <Row gutter={[16, 16]}>
        {data.map((c) => (
          <Col key={c.id} span={8}>
            <Card
              title={c.name}
              extra={<Tag color="blue">{c.category}</Tag>}
              actions={[
                c.studentIds.includes(user!.id) ? (
                  <Button danger onClick={() => handleDrop(c.id)}>
                    退课
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    disabled={!canEnroll(c.id).ok}
                    onClick={() => handleEnroll(c.id)}
                  >
                    {canEnroll(c.id).label}
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
