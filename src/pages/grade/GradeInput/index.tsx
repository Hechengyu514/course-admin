import { Card, Select, Table, InputNumber, Button, App, Empty } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { useGradeStore, calcGPA } from "@/store/gradeStore";
import { getGradesByCourseAPI } from "@/api/grade";
import type { Grade } from "@/types";

/**
 * 成绩录入（教师端）
 *
 * 教师选择自己的一门课 → 展示选课学生名单 → 录入百分制成绩 → 自动换算 GPA。
 * 已录过的成绩会自动回填，支持修改后重新保存。
 */

export default function GradeInput() {
  const { message } = App.useApp();
  const currentUser = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const { batchSaveGrades } = useGradeStore();
  const allUsers = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacherId === currentUser!.id),
    [courses, currentUser],
  );

  const [selectedCourseId, setSelectedCourseId] = useState<number>();
  const [scoreMap, setScoreMap] = useState<Record<number, number>>({});

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledStudents = useMemo(
    () => (selectedCourse ? allUsers.filter((u) => selectedCourse.studentIds.includes(u.id)) : []),
    [selectedCourse, allUsers],
  );

  const handleCourseChange = async (courseId: number) => {
    setSelectedCourseId(courseId);
    const map: Record<number, number> = {};
    try {
      const courseGrades = await getGradesByCourseAPI(courseId);
      courseGrades.forEach((g: Grade) => { map[g.studentId] = g.score; });
    } catch { /* 无已有成绩，map 保持为空 */ }
    setScoreMap(map);
  };

  const handleScoreChange = (studentId: number, value: number | null) => {
    setScoreMap((prev) => ({ ...prev, [studentId]: value ?? 0 }));
  };

  const handleSave = () => {
    if (!selectedCourse) return;
    const newGrades: Grade[] = enrolledStudents
      .filter((s) => scoreMap[s.id] !== undefined)
      .map((s) => ({
        courseId: selectedCourse.id,
        studentId: s.id,
        score: scoreMap[s.id],
        gpa: calcGPA(scoreMap[s.id]),
        semester: selectedCourse.semester,
      }));
    batchSaveGrades(newGrades);
    message.success(`已保存 ${newGrades.length} 条成绩`);
  };

  const columns = [
    { title: "姓名", dataIndex: "name" },
    { title: "学号", dataIndex: "id" },
    {
      title: "百分制成绩",
      render: (_: unknown, record: { id: number }) => (
        <InputNumber min={0} max={100} value={scoreMap[record.id]}
          onChange={(v) => handleScoreChange(record.id, v)} style={{ width: 100 }} />
      ),
    },
    {
      title: "GPA",
      render: (_: unknown, record: { id: number }) => {
        const s = scoreMap[record.id];
        return s !== undefined ? calcGPA(s).toFixed(1) : "-";
      },
    },
  ];

  return (
    <Card title="成绩录入">
      <Select
        placeholder="选择一门课程"
        value={selectedCourseId}
        onChange={handleCourseChange}
        options={myCourses.map((c) => ({ value: c.id, label: c.name }))}
        style={{ width: 300, marginBottom: 24 }}
      />

      {selectedCourse ? (
        <>
          <Table columns={columns} dataSource={enrolledStudents} rowKey="id" pagination={false} />
          <Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>保存成绩</Button>
        </>
      ) : (
        <Empty description="请先选择课程" />
      )}
    </Card>
  );
}
