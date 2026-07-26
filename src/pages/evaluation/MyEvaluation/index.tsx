import { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Rate, Input, Tag, App, Empty } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { useEvaluationStore } from "@/store/evaluationStore";
import { useSemesterStore } from "@/store/semesterStore";
import type { Course } from "@/types";

/**
 * 学生评教
 *
 * 学生查看自己已选课程，对未评教的课程进行打分 + 文字评价。
 */
export default function MyEvaluation() {
  const { message } = App.useApp();
  const user = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const myEvaluations = useEvaluationStore((s) => s.myEvaluations);
  const fetchMyEvaluations = useEvaluationStore((s) => s.fetchMyEvaluations);
  const submitEvaluation = useEvaluationStore((s) => s.submitEvaluation);
  const loading = useEvaluationStore((s) => s.loading);
  const currentSemester = useSemesterStore((s) => s.currentSemester);

  useEffect(() => {
    fetchCourses();
    if (user) fetchMyEvaluations(user.id);
  }, [fetchCourses, fetchMyEvaluations, user]);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetCourse, setTargetCourse] = useState<Course | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 等待 store hydration
  if (!user) return null;

  // 学生在当前学期已选课程（已完成、可评教）
  const evaluableCourses = courses.filter(
    (c) =>
      c.studentIds.includes(user.id) &&
      c.semester === currentSemester &&
      !myEvaluations.some((e) => e.courseId === c.id),
  );

  const evaluatedCourseIds = new Set(myEvaluations.map((e) => e.courseId));

  const handleOpen = (course: Course) => {
    setTargetCourse(course);
    setScore(0);
    setComment("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!targetCourse || score === 0) {
      message.warning("请给出评分");
      return;
    }
    setSubmitting(true);
    try {
      await submitEvaluation({
        courseId: targetCourse.id,
        studentId: user.id,
        teacherId: targetCourse.teacherId,
        courseName: targetCourse.name,
        semester: targetCourse.semester,
        score,
        comment,
      });
      setModalOpen(false);
      message.success("评教提交成功");
    } catch {
      message.error("评教提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: "课程名", dataIndex: "name" },
    { title: "授课教师", dataIndex: "teacherName" },
    { title: "学期", dataIndex: "semester" },
    {
      title: "状态",
      key: "status",
      render: (_: unknown, record: Course) =>
        evaluatedCourseIds.has(record.id) ? (
          <Tag color="green">已评教</Tag>
        ) : (
          <Tag color="orange">待评教</Tag>
        ),
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: Course) =>
        evaluatedCourseIds.has(record.id) ? (
          <span style={{ color: "#999" }}>已完成</span>
        ) : (
          <Button type="link" onClick={() => handleOpen(record)}>
            <EditOutlined /> 去评教
          </Button>
        ),
    },
  ];

  const allCourses = [
    ...evaluableCourses,
    ...courses.filter(
      (c) =>
        c.studentIds.includes(user.id) &&
        c.semester === currentSemester &&
        evaluatedCourseIds.has(c.id),
    ),
  ];

  return (
    <Card title="学生评教">
      {allCourses.length === 0 ? (
        <Empty description="暂无可评教的课程" />
      ) : (
        <Table
          columns={columns}
          dataSource={allCourses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        title={targetCourse ? `评教：${targetCourse.name}` : "评教"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
      >
        {targetCourse && (
          <div>
            <p>
              授课教师：<strong>{targetCourse.teacherName}</strong>
            </p>
            <div style={{ margin: "16px 0" }}>
              <span style={{ marginRight: 8 }}>评分：</span>
              <Rate value={score} onChange={setScore} />
            </div>
            <div>
              <span style={{ marginRight: 8 }}>评价：</span>
              <Input.TextArea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="请写下你对这门课程的评价（选填）"
              />
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}
