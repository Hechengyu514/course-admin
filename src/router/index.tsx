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

// ========== 路由懒加载 ==========
const ScheduleView = lazy(() => import("@/pages/dashboard/ScheduleView"));
const CourseManage = lazy(() => import("@/pages/course/CourseManage"));
const CourseDetail = lazy(() => import("@/pages/course/CourseDetail"));
const EnrollSystem = lazy(() => import("@/pages/course/EnrollSystem"));
const StudentManage = lazy(() => import("@/pages/user/StudentManage"));
const TeacherManage = lazy(() => import("@/pages/user/TeacherManage"));
const GradeInput = lazy(() => import("@/pages/grade/GradeInput"));
const GradeQuery = lazy(() => import("@/pages/grade/GradeQuery"));
const Logs = lazy(() => import("@/pages/log/Logs"));

// 懒加载包裹组件：显示 loading 动画等待 chunk 下载
const Lazy = ({ Page }: { Page: ComponentType }) => (
  <Suspense
    fallback={
      <div style={{ display: "flex", justifyContent: "center", padding: 120 }}>
        <Spin size="large" />
      </div>
    }
  >
    <Page />
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
    element: <Lazy Page={StudentManage} />,
    roles: ["admin"],
  },
  {
    path: "teachers",
    element: <Lazy Page={TeacherManage} />,
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
                <Lazy Page={ScheduleView} />
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
