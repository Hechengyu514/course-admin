import { http, HttpResponse } from "msw";
import { classes, requireRole } from "../data";

export const classHandlers = [
  http.get("/api/classes", ({ request }) => {
    const caller = requireRole(request, "admin", "teacher");
    if (!caller) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    return HttpResponse.json(classes);
  }),

  http.get("/api/classes/:id", ({ request, params }) => {
    const caller = requireRole(request, "admin", "teacher");
    if (!caller) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    const id = Number(params.id);
    const cls = classes.find((c) => c.id === id);
    if (!cls) {
      return HttpResponse.json({ error: "班级不存在" }, { status: 404 });
    }
    return HttpResponse.json(cls);
  }),
];
