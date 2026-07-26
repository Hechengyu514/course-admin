import { http, HttpResponse } from "msw";
import { announcements, counters, pushLog, requireRole } from "../data";
import type { Announcement } from "@/types";

export const announcementHandlers = [
  // 获取全部公告（所有角色可读）
  http.get("/api/announcements", () => {
    return HttpResponse.json(announcements);
  }),

  // 新建公告（仅 admin）
  http.post("/api/announcements", async ({ request }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅管理员可发布公告" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as {
      title: string;
      content: string;
      publisherId: number;
    };
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const item: Announcement = {
      id: counters.announcement++,
      title: body.title,
      content: body.content,
      publisherId: caller.id,
      publisherName: caller.name,
      createdAt: now,
      updatedAt: now,
    };
    announcements.unshift(item);
    pushLog(caller.id, caller.name, "发布公告", `发布了公告「${item.title}」`);
    return HttpResponse.json(item, { status: 201 });
  }),

  // 编辑公告（仅 admin）
  http.put("/api/announcements/:id", async ({ request, params }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅管理员可编辑公告" },
        { status: 403 },
      );
    }
    const id = Number(params.id);
    const body = (await request.json()) as { title?: string; content?: string };
    const idx = announcements.findIndex((a) => a.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: "公告不存在" }, { status: 404 });
    }
    const item = announcements[idx]!;
    if (body.title !== undefined) item.title = body.title;
    if (body.content !== undefined) item.content = body.content;
    item.updatedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
    pushLog(caller.id, caller.name, "修改公告", `修改了公告「${item.title}」`);
    return HttpResponse.json(item);
  }),

  // 删除公告（仅 admin）
  http.delete("/api/announcements/:id", ({ request, params }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅管理员可删除公告" },
        { status: 403 },
      );
    }
    const id = Number(params.id);
    const idx = announcements.findIndex((a) => a.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: "公告不存在" }, { status: 404 });
    }
    const removed = announcements[idx]!;
    announcements.splice(idx, 1);
    pushLog(
      caller.id,
      caller.name,
      "删除公告",
      `删除了公告「${removed.title}」`,
    );
    return HttpResponse.json(null, { status: 204 });
  }),
];
