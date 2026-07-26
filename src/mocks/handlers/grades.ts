import { http, HttpResponse } from "msw";
import { grades, pushLog, getUserFromRequest, requireRole } from "../data";
import type { Grade } from "@/types";

export const gradeHandlers = [
  // 按学生查询成绩（仅学生本人或 admin 可查）
  http.get("/api/grades/student/:studentId", ({ params, request }) => {
    const caller = getUserFromRequest(request);
    const studentId = Number(params.studentId);
    // 学生只能查自己，admin 可查任意学生
    if (!caller || (caller.role !== "admin" && caller.id !== studentId)) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    const url = new URL(request.url);
    const semester = url.searchParams.get("semester");

    let result = grades.filter((g) => g.studentId === studentId);
    if (semester) {
      result = result.filter((g) => g.semester === semester);
    }
    return HttpResponse.json(result);
  }),

  // 按课程查询成绩（仅授课教师或 admin 可查）
  http.get("/api/grades/course/:courseId", ({ params, request }) => {
    const caller = requireRole(request, "admin", "teacher");
    if (!caller) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    const courseId = Number(params.courseId);
    return HttpResponse.json(grades.filter((g) => g.courseId === courseId));
  }),

  // 批量保存成绩（仅 teacher）
  http.post("/api/grades/batch", async ({ request }) => {
    const caller = requireRole(request, "teacher");
    if (!caller) {
      return HttpResponse.json({ error: "无权限：仅教师可录入成绩" }, { status: 403 });
    }
    const body = (await request.json()) as Grade[];
    for (const g of body) {
      const idx = grades.findIndex(
        (e) => e.courseId === g.courseId && e.studentId === g.studentId && e.semester === g.semester,
      );
      if (idx >= 0) {
        grades[idx] = g;
      } else {
        grades.push(g);
      }
    }
    if (body.length > 0) {
      pushLog(caller.id, caller.name, "录入成绩", `批量录入了 ${body.length} 条成绩`);
    }
    return HttpResponse.json(body);
  }),
];
