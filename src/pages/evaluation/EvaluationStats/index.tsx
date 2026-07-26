import { useEffect, useMemo, useState } from "react";
import { Card, Table, Select, Statistic, Row, Col, Rate, Empty } from "antd";
import { useUserStore } from "@/store/userStore";
import { useCourseStore } from "@/store/courseStore";
import { useEvaluationStore } from "@/store/evaluationStore";

/**
 * 评教统计（教师/管理员端）
 *
 * 教师查看自己课程的评教结果，管理员可选择查看任意教师的评教。
 */
export default function EvaluationStats() {
  const currentUser = useUserStore((s) => s.currentUser);
  const allUsers = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const viewedEvaluations = useEvaluationStore((s) => s.viewedEvaluations);
  const fetchByTeacher = useEvaluationStore((s) => s.fetchByTeacher);
  const loading = useEvaluationStore((s) => s.loading);

  const isAdmin = currentUser?.role === "admin";
  const [adminSelectedTeacherId, setAdminSelectedTeacherId] =
    useState<number>();

  useEffect(() => {
    fetchCourses();
    if (isAdmin) {
      fetchUsers();
    } else if (currentUser) {
      fetchByTeacher(currentUser.id);
    }
  }, [fetchCourses, fetchByTeacher, fetchUsers, currentUser, isAdmin]);

  // 管理员选择教师后查询
  useEffect(() => {
    if (isAdmin && adminSelectedTeacherId) {
      fetchByTeacher(adminSelectedTeacherId);
    }
  }, [isAdmin, adminSelectedTeacherId, fetchByTeacher]);

  const teachers = useMemo(
    () => allUsers.filter((u) => u.role === "teacher"),
    [allUsers],
  );

  // 统计
  const stats = useMemo(() => {
    if (viewedEvaluations.length === 0) {
      return { avg: 0, count: 0, max: 0, min: 0 };
    }
    const scores = viewedEvaluations.map((e) => e.score);
    return {
      avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
      count: scores.length,
      max: Math.max(...scores),
      min: Math.min(...scores),
    };
  }, [viewedEvaluations]);

  const hasData = viewedEvaluations.length > 0;

  // 按课程分组
  const courseEvalStats = useMemo(() => {
    const map: Record<
      number,
      { courseName: string; total: number; count: number }
    > = {};
    viewedEvaluations.forEach((e) => {
      if (!map[e.courseId]) {
        map[e.courseId] = { courseName: e.courseName, total: 0, count: 0 };
      }
      map[e.courseId]!.total += e.score;
      map[e.courseId]!.count += 1;
    });
    return Object.entries(map).map(([courseId, data]) => ({
      courseId: Number(courseId),
      courseName: data.courseName,
      avgScore: (data.total / data.count).toFixed(1),
      count: data.count,
    }));
  }, [viewedEvaluations]);

  const columns = [
    { title: "课程名", dataIndex: "courseName" },
    { title: "学生", dataIndex: "studentName", width: 100 },
    {
      title: "评分",
      dataIndex: "score",
      width: 200,
      render: (v: number) => <Rate disabled value={v} />,
    },
    { title: "评价", dataIndex: "comment", ellipsis: true },
    { title: "时间", dataIndex: "createdAt", width: 180 },
  ];

  return (
    <div>
      {isAdmin && (
        <Card style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 8 }}>选择教师查看评教：</span>
          <Select
            placeholder="选择教师"
            value={adminSelectedTeacherId}
            onChange={setAdminSelectedTeacherId}
            style={{ width: 200 }}
            options={teachers.map((t) => ({
              value: t.id,
              label: `${t.name}（${t.department}）`,
            }))}
          />
        </Card>
      )}

      {!isAdmin && !hasData && !loading ? (
        <Empty description="暂无评教数据" />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic title="评价总数" value={stats.count} suffix="条" />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="平均评分"
                  value={hasData ? stats.avg : "-"}
                  suffix={hasData ? "分" : ""}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="最高评分"
                  value={hasData ? stats.max : "-"}
                  suffix={hasData ? "分" : ""}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="最低评分"
                  value={hasData ? stats.min : "-"}
                  suffix={hasData ? "分" : ""}
                />
              </Card>
            </Col>
          </Row>

          {courseEvalStats.length > 0 && (
            <Card title="课程评教汇总" style={{ marginBottom: 24 }}>
              <Table
                columns={[
                  { title: "课程名", dataIndex: "courseName" },
                  { title: "评价人数", dataIndex: "count" },
                  { title: "平均分", dataIndex: "avgScore" },
                ]}
                dataSource={courseEvalStats}
                rowKey="courseId"
                pagination={false}
                size="small"
              />
            </Card>
          )}

          <Card title="评价明细">
            <Table
              columns={columns}
              dataSource={viewedEvaluations}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
