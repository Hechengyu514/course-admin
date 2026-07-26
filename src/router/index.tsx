import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spin } from "antd";
import type { ComponentType, ReactNode } from "react";
import type { Role } from "@/types";
import Login from "@/pages/auth/Login";
import RouteGuard from "./RouteGuard";
import MainLayout from "@/layouts/MainLayout";
import Forbidden from "@/pages/error/Forbidden";
import NotFound from "@/pages/error/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// ========== 路由懒加载 ==========
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const ScheduleView = lazy(() => import("@/pages/dashboard/ScheduleView"));
const CourseManage = lazy(() => import("@/pages/course/CourseManage"));
const CourseDetail = lazy(() => import("@/pages/course/CourseDetail"));
const EnrollSystem = lazy(() => import("@/pages/course/EnrollSystem"));
const UserManage = lazy(() => import("@/pages/user/UserManage"));
const GradeInput = lazy(() => import("@/pages/grade/GradeInput"));
const GradeQuery = lazy(() => import("@/pages/grade/GradeQuery"));
const Logs = lazy(() => import("@/pages/log/Logs"));
const Profile = lazy(() => import("@/pages/profile/Profile"));
const AnnouncementManage = lazy(() => import("@/pages/announcement/AnnouncementManage"));
const MyEvaluation = lazy(() => import("@/pages/evaluation/MyEvaluation"));
const EvaluationStats = lazy(() => import("@/pages/evaluation/EvaluationStats"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

// 稳定包装组件
function StudentUserManage() {
  return <UserManage role="student" />;
}
function TeacherUserManage() {
  return <UserManage role="teacher" />;
}

const Lazy = ({ Page }: { Page: ComponentType }) => (
  <Suspense
    fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: 120 }}>
        <Spin size="large" />
      </div>
    }
  >
    <ErrorBoundary>
      <Page />
    </ErrorBoundary>
  </Suspense>
);

// ========== 路由表 ==========
interface RouteItem {
  path: string;
  element: ReactNode;
  roles: Role[];
}

const routeConfig: RouteItem[] = [
  {
    path: "schedule",
    element: <Lazy Page={ScheduleView} />,
    roles: ["admin", "teacher", "student"],
  },
  {
    path: "courses",
    element: <Lazy Page={CourseManage} />,
    roles: ["admin", "teacher"],
  },
  {
    path: "courses/:id",
    element: <Lazy Page={CourseDetail} />,
    roles: ["admin", "teacher", "student"],
  },
  { path: "enroll", element: <Lazy Page={EnrollSystem} />, roles: ["student"] },
  {
    path: "students",
    element: <Lazy Page={StudentUserManage} />,
    roles: ["admin"],
  },
  {
    path: "teachers",
    element: <Lazy Page={TeacherUserManage} />,
    roles: ["admin"],
  },
  {
    path: "grade-input",
    element: <Lazy Page={GradeInput} />,
    roles: ["teacher"],
  },
  {
    path: "grade-query",
    element: <Lazy Page={GradeQuery} />,
    roles: ["student"],
  },
  { path: "logs", element: <Lazy Page={Logs} />, roles: ["admin"] },
  {
    path: "announcements",
    element: <Lazy Page={AnnouncementManage} />,
    roles: ["admin", "teacher", "student"],
  },
  {
    path: "profile",
    element: <Lazy Page={Profile} />,
    roles: ["admin", "teacher", "student"],
  },
  {
    path: "my-evaluation",
    element: <Lazy Page={MyEvaluation} />,
    roles: ["student"],
  },
  {
    path: "evaluation-stats",
    element: <Lazy Page={EvaluationStats} />,
    roles: ["admin", "teacher"],
  },
  {
    path: "settings",
    element: <Lazy Page={Settings} />,
    roles: ["admin"],
  },
];

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route
            index
            element={
              <RouteGuard roles={["admin", "teacher", "student"]}>
                <Lazy Page={Dashboard} />
              </RouteGuard>
            }
          />

          {routeConfig.map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={<RouteGuard roles={r.roles}>{r.element}</RouteGuard>}
            />
          ))}

          <Route path="403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
