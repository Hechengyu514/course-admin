import {
  Card,
  Select,
  Table,
  InputNumber,
  Button,
  App,
  Empty,
  Row,
  Col,
  Statistic,
} from "antd";
import { useEffect, useState, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { useGradeStore, calcGPA } from "@/store/gradeStore";
import { getGradesByCourseAPI } from "@/api/grade";
import type { Grade } from "@/types";

const BAR_COLORS = ["#eb2f96", "#fa8c16", "#fadb14", "#52c41a", "#4e6ef2"];

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
    () => courses.filter((c) => c.teacherId === currentUser?.id),
    [courses, currentUser],
  );

  const [selectedCourseId, setSelectedCourseId] = useState<number>();
  const [scoreMap, setScoreMap] = useState<Record<number, number>>({});

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const enrolledStudents = useMemo(
    () =>
      selectedCourse
        ? allUsers.filter((u) => selectedCourse.studentIds.includes(u.id))
        : [],
    [selectedCourse, allUsers],
  );

  // 竞态防护：只处理最后一次请求的结果
  const latestCourseIdRef = useRef<number>(0);

  const handleCourseChange = async (courseId: number) => {
    setSelectedCourseId(courseId);
    latestCourseIdRef.current = courseId;
    const map: Record<number, number> = {};
    try {
      const courseGrades = await getGradesByCourseAPI(courseId);
      // 只处理最后一次选择的结果
      if (latestCourseIdRef.current !== courseId) return;
      courseGrades.forEach((g: Grade) => {
        map[g.studentId] = g.score;
      });
    } catch {
      // 无已有成绩，map 保持为空
    }
    if (latestCourseIdRef.current === courseId) {
      setScoreMap(map);
    }
  };

  const handleScoreChange = (studentId: number, value: number | null) => {
    setScoreMap((prev) => {
      const next = { ...prev };
      if (value === null || value === undefined) {
        delete next[studentId]; // 清除成绩时移除该条目
      } else {
        next[studentId] = value;
      }
      return next;
    });
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

  // 成绩分析
  const analysis = useMemo(() => {
    const scores = Object.values(scoreMap).filter((v) => v >= 0);
    if (scores.length === 0) return null;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passCount = scores.filter((s) => s >= 60).length;
    const dist = [
      { name: "0-59", range: [0, 59] as [number, number] },
      { name: "60-69", range: [60, 69] as [number, number] },
      { name: "70-79", range: [70, 79] as [number, number] },
      { name: "80-89", range: [80, 89] as [number, number] },
      { name: "90-100", range: [90, 100] as [number, number] },
    ].map((d) => ({
      name: d.name,
      人数: scores.filter((s) => s >= d.range[0] && s <= d.range[1]).length,
    }));
    return {
      avg: avg.toFixed(1),
      max: Math.max(...scores),
      min: Math.min(...scores),
      passRate: ((passCount / scores.length) * 100).toFixed(0),
      dist,
    };
  }, [scoreMap]);

  if (!currentUser) return null;

  const columns = [
    { title: "姓名", dataIndex: "name" },
    { title: "学号", dataIndex: "userId" },
    {
      title: "百分制成绩",
      render: (_: unknown, record: { id: number }) => (
        <InputNumber
          min={0}
          max={100}
          value={scoreMap[record.id]}
          onChange={(v) => handleScoreChange(record.id, v)}
          style={{ width: 100 }}
        />
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
          {analysis && (
            <div style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="平均分"
                      value={analysis.avg}
                      suffix="分"
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="最高分"
                      value={analysis.max}
                      suffix="分"
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="最低分"
                      value={analysis.min}
                      suffix="分"
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="及格率"
                      value={analysis.passRate}
                      suffix="%"
                    />
                  </Card>
                </Col>
              </Row>
              <Card title="分数段分布" size="small">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analysis.dist}>
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="人数" radius={[4, 4, 0, 0]}>
                      {analysis.dist.map((_, i) => (
                        <Cell
                          key={i}
                          fill={BAR_COLORS[i % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          <Table
            columns={columns}
            dataSource={enrolledStudents}
            rowKey="id"
            pagination={false}
          />
          <Button type="primary" onClick={handleSave} style={{ marginTop: 16 }}>
            保存成绩
          </Button>
        </>
      ) : (
        <Empty description="请先选择课程" />
      )}
    </Card>
  );
}
