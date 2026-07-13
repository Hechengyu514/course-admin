import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "@/types";
import { useUserStore } from "@/store/userStore";

/**
 * 路由守卫
 * - 未登录 → 跳转 /login
 * - 无权限 → 跳转 /403
 * - 有权限 → 渲染子路由
 */
interface Props {
  // 允许访问的角色列表
  roles: Role[];
  children: ReactNode;
}

export default function RouteGuard({ roles, children }: Props) {
  const user = useUserStore((s) => s.currentUser);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/403" replace />;
  return children;
}
