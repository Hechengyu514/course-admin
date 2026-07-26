import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Tag,
  Typography,
  Progress,
  Empty,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  ScheduleOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useUserStore } from "@/store/userStore";
import { useCourseStore } from "@/store/courseStore";
import { useAnnouncementStore } from "@/store/announcementStore";
import { useGradeStore } from "@/store/gradeStore";
import { useEvaluationStore } from "@/store/evaluationStore";
import { useSemesterStore } from "@/store/semesterStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getLogsAPI } from "@/api/log";
import { WEEKDAYS } from "@/constants";
import { formatTimeSlots } from "@/utils/formatTimeSlots";
import type { LogEntry, Announcement } from "@/types";

const CHART_COLORS = [
  "#4e6ef2",
  "#52c41a",
  "#fa8c16",
  "#eb2f96",
  "#13c2c2",
  "#722ed1",
];

const { Text } = Typography;

// ==================== 公告列表（三个仪表盘共用） ====================
function RecentAnnouncements({
  announcements,
}: {
  announcements: Announcement[];
}) {
  if (announcements.length === 0) return <Text type="secondary">暂无公告</Text>;
  return (
    <div>
      {announcements.slice(0, 5).map((item) => (
        <div
          key={item.id}
          style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}
        >
          <Text strong style={{ fontSize: 13 }}>
            {item.title}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {item.publisherName} · {item.createdAt}
          </Text>
        </div>
      ))}
    </div>
  );
}

/**
 * 仪表盘 — 按角色展示不同内容
 *
 * 管理员：系统全局统计
 * 教师：个人教学概览
 * 学生：个人学业概览
 */
export default function Dashboard() {
  const currentUser = useUserStore((s) => s.currentUser);
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);
  const announcements = useAnnouncementStore((s) => s.announcements);
  const fetchAnnouncements = useAnnouncementStore((s) => s.fetchAnnouncements);
  const grades = useGradeStore((s) => s.grades);
  const fetchGrades = useGradeStore((s) => s.fetchGrades);
  const currentSemester = useSemesterStore((s) => s.currentSemester);
  const maxCredits = useSettingsStore((s) => s.maxCredits);

  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchAnnouncements();
    if (currentUser?.role === "admin") {
      fetchUsers();
      getLogsAPI()
        .then(setLogs)
        .catch(() => setLogs([]));
    }
    if (currentUser?.role === "student") {
      fetchGrades(currentUser!.id);
    }
  }, [fetchCourses, fetchAnnouncements, fetchUsers, fetchGrades, currentUser]);

  if (!currentUser) return null;

  return (
    <div>
      {currentUser.role === "admin" && (
        <AdminDashboard
          users={users}
          courses={courses}
          currentSemester={currentSemester}
          announcements={announcements}
          grades={grades}
          logs={logs}
        />
      )}
      {currentUser.role === "teacher" && (
        <TeacherDashboard
          currentUser={currentUser}
          courses={courses}
          currentSemester={currentSemester}
          announcements={announcements}
        />
      )}
      {currentUser.role === "student" && (
        <StudentDashboard
          currentUser={currentUser}
          courses={courses}
          currentSemester={currentSemester}
          announcements={announcements}
          grades={grades}
          maxCredits={maxCredits}
        />
      )}
    </div>
  );
}

// ==================== 管理员仪表盘 ====================
function AdminDashboard({
  users,
  courses,
  currentSemester,
  announcements,
  grades,
  logs,
}: {
  users: ReturnType<typeof useUserStore.getState>["users"];
  courses: ReturnType<typeof useCourseStore.getState>["courses"];
  currentSemester: string;
  announcements: ReturnType<
    typeof useAnnouncementStore.getState
  >["announcements"];
  grades: ReturnType<typeof useGradeStore.getState>["grades"];
  logs: LogEntry[];
}) {
  const stats = useMemo(() => {
    const students = users.filter((u) => u.role === "student");
    const teachers = users.filter((u) => u.role === "teacher");
    const currentCourses = courses.filter(
      (c) => c.semester === currentSemester,
    );
    const totalEnrollments = courses.reduce(
      (sum, c) => sum + c.enrolledCount,
      0,
    );
    return {
      totalStudents: students.length,
      totalTeachers: teachers.length,
      currentCourses: currentCourses.length,
      totalCourses: courses.length,
      totalEnrollments,
    };
  }, [users, courses, currentSemester]);

  const recentLogs = useMemo(() => logs.slice(0, 5), [logs]);

  const categoryPieData = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((c) => {
      map[c.category] = (map[c.category] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [courses]);

  const deptBarData = useMemo(() => {
    const map: Record<string, { students: number; teachers: number }> = {};
    users.forEach((u) => {
      if (!map[u.department]) map[u.department] = { students: 0, teachers: 0 };
      if (u.role === "student") map[u.department]!.students++;
      if (u.role === "teacher") map[u.department]!.teachers++;
    });
    return Object.entries(map).map(([name, data]) => ({
      name: name.length > 6 ? name.slice(0, 6) + "…" : name,
      学生: data.students,
      教师: data.teachers,
    }));
  }, [users]);

  const gradeDistData = useMemo(() => {
    const bins = [
      { name: "0-59", min: 0, max: 59 },
      { name: "60-69", min: 60, max: 69 },
      { name: "70-79", min: 70, max: 79 },
      { name: "80-89", min: 80, max: 89 },
      { name: "90-100", min: 90, max: 100 },
    ];
    return bins.map((bin) => ({
      name: bin.name,
      人数: grades.filter((g) => g.score >= bin.min && g.score <= bin.max)
        .length,
    }));
  }, [grades]);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.totalStudents}
              prefix={<UserOutlined />}
              styles={{ content: { color: "#4e6ef2" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="教师总数"
              value={stats.totalTeachers}
              prefix={<TeamOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`${currentSemester} 开课数`}
              value={stats.currentCourses}
              prefix={<BookOutlined />}
              styles={{ content: { color: "#fa8c16" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="选课总人次"
              value={stats.totalEnrollments}
              prefix={<ShoppingCartOutlined />}
              styles={{ content: { color: "#eb2f96" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最新公告" style={{ marginBottom: 16 }}>
            <RecentAnnouncements announcements={announcements} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近操作日志" style={{ marginBottom: 16 }}>
            <Table
              dataSource={recentLogs}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: "操作人", dataIndex: "userName", width: 80 },
                { title: "操作", dataIndex: "action", width: 80 },
                {
                  title: "时间",
                  dataIndex: "time",
                  width: 160,
                  render: (v: string) => (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {v}
                    </Text>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="课程分类分布">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}门`}
                >
                  {categoryPieData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="各院系人数">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptBarData}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="学生" fill="#4e6ef2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="教师" fill="#52c41a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="成绩分布">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradeDistData}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="人数" fill="#fa8c16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}

// ==================== 教师仪表盘 ====================
function TeacherDashboard({
  currentUser,
  courses,
  currentSemester,
  announcements,
}: {
  currentUser: ReturnType<typeof useUserStore.getState>["currentUser"] & {
    id: number;
    name: string;
  };
  courses: ReturnType<typeof useCourseStore.getState>["courses"];
  currentSemester: string;
  announcements: ReturnType<
    typeof useAnnouncementStore.getState
  >["announcements"];
}) {
  const evalStore = useEvaluationStore();

  useEffect(() => {
    evalStore.fetchByTeacher(currentUser.id);
  }, [currentUser.id, evalStore]);

  const myCourses = useMemo(
    () =>
      courses.filter(
        (c) => c.semester === currentSemester && c.teacherId === currentUser.id,
      ),
    [courses, currentSemester, currentUser.id],
  );

  const myAllCourses = useMemo(
    () => courses.filter((c) => c.teacherId === currentUser.id),
    [courses, currentUser.id],
  );

  const stats = useMemo(() => {
    const uniqueStudents = new Set(myCourses.flatMap((c) => c.studentIds));
    const totalStudents = uniqueStudents.size;
    const totalEnrolled = myCourses.reduce((s, c) => s + c.enrolledCount, 0);
    const myEvals = evalStore.viewedEvaluations;
    const avgScore =
      myEvals.length > 0
        ? (myEvals.reduce((s, e) => s + e.score, 0) / myEvals.length).toFixed(1)
        : "—";
    return {
      courseCount: myCourses.length,
      totalStudents,
      totalEnrolled,
      avgScore,
      totalCourses: myAllCourses.length,
    };
  }, [myCourses, myAllCourses, evalStore.viewedEvaluations]);

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={`${currentSemester} 授课`}
              value={stats.courseCount}
              suffix="门"
              prefix={<BookOutlined />}
              styles={{ content: { color: "#4e6ef2" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="授课学生数"
              value={stats.totalStudents}
              suffix="人"
              prefix={<UserOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="评教均分"
              value={stats.avgScore}
              prefix={<StarOutlined />}
              styles={{ content: { color: "#fa8c16" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="历史开课"
              value={stats.totalCourses}
              suffix="门"
              prefix={<ScheduleOutlined />}
              styles={{ content: { color: "#eb2f96" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={`${currentSemester} 我的课程`}>
            {myCourses.length === 0 ? (
              <Empty description="本学期暂无课程" />
            ) : (
              <Table
                dataSource={myCourses}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: "课程名", dataIndex: "name" },
                  { title: "教室", dataIndex: "classroom", width: 110 },
                  {
                    title: "上课时间",
                    render: (_: unknown, r: (typeof myCourses)[number]) =>
                      formatTimeSlots(r.timeSlots),
                    width: 200,
                  },
                  {
                    title: "选课人数",
                    render: (_: unknown, r: (typeof myCourses)[number]) =>
                      `${r.enrolledCount}/${r.capacity}`,
                    width: 80,
                  },
                  {
                    title: "分类",
                    dataIndex: "category",
                    width: 60,
                    render: (v: string) => (
                      <Tag
                        color={
                          v === "必修"
                            ? "blue"
                            : v === "选修"
                              ? "green"
                              : "orange"
                        }
                      >
                        {v}
                      </Tag>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最新公告" style={{ marginBottom: 16 }}>
            <RecentAnnouncements announcements={announcements} />
          </Card>
        </Col>
      </Row>
    </>
  );
}

// ==================== 学生仪表盘 ====================
function StudentDashboard({
  currentUser,
  courses,
  currentSemester,
  announcements,
  grades,
  maxCredits,
}: {
  currentUser: ReturnType<typeof useUserStore.getState>["currentUser"] & {
    id: number;
    name: string;
  };
  courses: ReturnType<typeof useCourseStore.getState>["courses"];
  currentSemester: string;
  announcements: ReturnType<
    typeof useAnnouncementStore.getState
  >["announcements"];
  grades: ReturnType<typeof useGradeStore.getState>["grades"];
  maxCredits: number;
}) {
  const myEnrolledCourses = useMemo(
    () =>
      courses.filter(
        (c) =>
          c.semester === currentSemester &&
          c.studentIds.includes(currentUser.id),
      ),
    [courses, currentSemester, currentUser.id],
  );

  // 共享过滤：成绩只算一次，stats 和 recentGrades 共用
  const myGrades = useMemo(
    () => grades.filter((g) => g.studentId === currentUser.id),
    [grades, currentUser.id],
  );

  // 共享过滤：今日课程只算一次，stats 和 UI 共用
  const weekday = useMemo(() => {
    const today = new Date().getDay();
    return today === 0 ? 7 : today;
  }, []);

  const todayCourses = useMemo(
    () =>
      myEnrolledCourses.filter((c) =>
        c.timeSlots.some((s) => s.day === weekday),
      ),
    [myEnrolledCourses, weekday],
  );

  const stats = useMemo(() => {
    const totalCredits = myEnrolledCourses.reduce((s, c) => s + c.credits, 0);
    const avgGPA =
      myGrades.length > 0
        ? (myGrades.reduce((s, g) => s + g.gpa, 0) / myGrades.length).toFixed(2)
        : "—";
    return {
      totalCredits,
      creditPercent:
        maxCredits > 0 ? Math.round((totalCredits / maxCredits) * 100) : 0,
      courseCount: myEnrolledCourses.length,
      avgGPA,
      todayCourseCount: todayCourses.length,
    };
  }, [myEnrolledCourses, myGrades, maxCredits, todayCourses.length]);

  // 最近的成绩
  const recentGrades = useMemo(
    () =>
      myGrades
        .slice(-6)
        .reverse()
        .map((g) => {
          const course = courses.find((c) => c.id === g.courseId);
          return {
            ...g,
            courseName: course?.name ?? "未知课程",
            credits: course?.credits ?? 0,
          };
        }),
    [myGrades, courses],
  );

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本学期课程"
              value={stats.courseCount}
              suffix="门"
              prefix={<BookOutlined />}
              styles={{ content: { color: "#4e6ef2" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                已选学分
              </Text>
            </div>
            <Statistic
              title=""
              value={stats.totalCredits}
              suffix={`/ ${maxCredits}`}
              styles={{ content: { color: "#52c41a", fontSize: 24 } }}
            />
            <Progress
              percent={stats.creditPercent}
              showInfo={false}
              size="small"
              strokeColor={stats.creditPercent > 90 ? "#e74c3c" : "#52c41a"}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="累计 GPA"
              value={stats.avgGPA}
              prefix={<StarOutlined />}
              styles={{ content: { color: "#fa8c16" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={WEEKDAYS[weekday - 1] ?? "今日"}
              value={stats.todayCourseCount}
              suffix="节"
              styles={{ content: { color: "#eb2f96" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title={`${currentSemester} 我的课程`}>
            {myEnrolledCourses.length === 0 ? (
              <Empty description="本学期暂无选课" />
            ) : (
              <Table
                dataSource={myEnrolledCourses}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: "课程名", dataIndex: "name" },
                  { title: "教师", dataIndex: "teacherName", width: 80 },
                  { title: "学分", dataIndex: "credits", width: 50 },
                  {
                    title: "时间",
                    render: (
                      _: unknown,
                      r: (typeof myEnrolledCourses)[number],
                    ) => formatTimeSlots(r.timeSlots),
                  },
                  { title: "教室", dataIndex: "classroom", width: 100 },
                ]}
              />
            )}
          </Card>
          {todayCourses.length > 0 && (
            <Card
              title={`${WEEKDAYS[weekday - 1]} 课程安排`}
              style={{ marginTop: 16 }}
            >
              {todayCourses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    marginBottom: 8,
                    padding: "8px 12px",
                    background: "#f0f5ff",
                    borderRadius: 6,
                  }}
                >
                  <Text strong>{c.name}</Text>
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    {c.timeSlots
                      .filter((s) => s.day === weekday)
                      .map((s) => `${s.start}-${s.start + s.duration - 1}节`)
                      .join(" ")}{" "}
                    · {c.classroom}
                  </Text>
                </div>
              ))}
            </Card>
          )}
        </Col>
        <Col xs={24} lg={10}>
          <Card title="最新公告">
            <RecentAnnouncements announcements={announcements} />
          </Card>
          <Card title="最近成绩" style={{ marginTop: 16 }}>
            {recentGrades.length === 0 ? (
              <Text type="secondary">暂无成绩</Text>
            ) : (
              <Table
                dataSource={recentGrades}
                rowKey={(r) => `${r.courseId}-${r.studentId}`}
                pagination={false}
                size="small"
                columns={[
                  { title: "课程", dataIndex: "courseName" },
                  {
                    title: "成绩",
                    dataIndex: "score",
                    width: 60,
                    render: (v: number) => (
                      <Text style={{ color: v >= 60 ? "#52c41a" : "#e74c3c" }}>
                        {v}
                      </Text>
                    ),
                  },
                  {
                    title: "GPA",
                    dataIndex: "gpa",
                    width: 50,
                    render: (v: number) => v.toFixed(1),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}
