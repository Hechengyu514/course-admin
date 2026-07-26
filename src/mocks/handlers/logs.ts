import { http, HttpResponse } from "msw";
import { logs, pushLog, requireRole } from "../data";

export const logHandlers = [
  // 获取日志（仅 admin）
  http.get("/api/logs", ({ request }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json({ error: "无权限：仅管理员可查看日志" }, { status: 403 });
    }
    return HttpResponse.json(logs);
  }),

  // 新增日志（供前端内部调用）
  http.post("/api/logs", async ({ request }) => {
    const body = (await request.json()) as { userId: number; userName: string; action: string; detail: string };
    pushLog(body.userId, body.userName, body.action, body.detail);
    return HttpResponse.json({ success: true }, { status: 201 });
  }),
];
