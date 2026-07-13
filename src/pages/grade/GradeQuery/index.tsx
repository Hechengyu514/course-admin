import { Card, Table, Select, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useGradeStore } from "@/store/gradeStore";
import { useUserStore } from "@/store/userStore";
import { useCourseStore } from "@/store/courseStore";
import { SEMESTERS } from "@/constants";

const { Text } = Typography;

const columns = [
  { title: "课程名", dataIndex: "courseName", key: "courseName" },
  { title: "学分", dataIndex: "credits", key: "credits" },
  { title: "百分制成绩", dataIndex: "score", key: "score" },
  { title: "GPA", dataIndex: "gpa", key: "gpa" },
];

/**
 * 成绩查询（学生端）
 *
 * 按学期查看自己的成绩单，含 GPA 和学期平均 GPA。
 * 成绩按百分制降序排列。
 */

export default function GradeQuery() {
  const user = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const grades = useGradeStore((s) => s.grades);
  const fetchGrades = useGradeStore((s) => s.fetchGrades);
  const [semester, setSemester] = useState<string>();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (user) fetchGrades(user.id, semester);
  }, [user, semester, fetchGrades]);

  const rows = useMemo(
    () =>
      grades
        .filter((g) => g.studentId === user!.id)
        .filter((g) => !semester || g.semester === semester)
        .map((g) => {
          const course = courses.find((c) => c.id === g.courseId);
          return {
            key: `${g.courseId}-${g.studentId}`,
            courseName: course?.name ?? "未知课程",
            credits: course?.credits ?? 0,
            score: g.score,
            gpa: g.gpa,
          };
        })
        .sort((a, b) => b.score - a.score),
    [grades, courses, user, semester],
  );

  const avgGPA = useMemo(() => {
    if (rows.length === 0) return 0;
    const total = rows.reduce((sum, r) => sum + r.gpa, 0);
    return (total / rows.length).toFixed(2);
  }, [rows]);

  return (
    <Card
      title="成绩查询"
      extra={
        <Select
          placeholder="筛选学期"
          allowClear
          onChange={setSemester}
          options={SEMESTERS.map((s) => ({ value: s, label: s }))}
          style={{ width: 180 }}
        />
      }
    >
      <Table
        columns={columns}
        dataSource={rows}
        rowKey="key"
        pagination={false}
        footer={() => (
          <div style={{ textAlign: "right" }}>
            <Text strong>学期平均 GPA：{avgGPA}</Text>
          </div>
        )}
      />
    </Card>
  );
}
