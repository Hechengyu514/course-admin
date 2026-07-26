import { http, HttpResponse } from "msw";
import {
  courses,
  counterEvaluations,
  pushLog,
  getUserFromRequest,
  requireRole,
} from "../data";
import type { Evaluation } from "@/types";

export const evaluationHandlers = [
  // 获取学生的评教记录（学生本人或 admin 可查）
  http.get("/api/evaluations/student/:studentId", ({ params, request }) => {
    const caller = getUserFromRequest(request);
    const studentId = Number(params.studentId);
    if (!caller || (caller.role !== "admin" && caller.id !== studentId)) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    const result = counterEvaluations.filter((e) => e.studentId === studentId);
    return HttpResponse.json(result);
  }),

  // 获取学生待评教的课程ID列表（学生本人可查）
  http.get("/api/evaluations/pending/:studentId", ({ params, request }) => {
    const caller = getUserFromRequest(request);
    const studentId = Number(params.studentId);
    if (!caller || (caller.role !== "admin" && caller.id !== studentId)) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    const evaluatedCourseIds = new Set(
      counterEvaluations
        .filter((e) => e.studentId === studentId)
        .map((e) => e.courseId),
    );
    const pending = courses
      .filter(
        (c) =>
          c.studentIds.includes(studentId) && !evaluatedCourseIds.has(c.id),
      )
      .map((c) => c.id);
    return HttpResponse.json(pending);
  }),

  // 提交评教（仅 student）
  http.post("/api/evaluations", async ({ request }) => {
    const caller = requireRole(request, "student");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅学生可提交评教" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as Omit<
      Evaluation,
      "id" | "studentName" | "createdAt"
    >;
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const item: Evaluation = {
      id: counterEvaluations.length + 1,
      ...body,
      studentId: caller.id,
      studentName: caller.name,
      createdAt: now,
    };
    counterEvaluations.push(item);
    pushLog(
      caller.id,
      caller.name,
      "学生评教",
      `对课程「${body.courseName}」提交了评教`,
    );
    return HttpResponse.json(item, { status: 201 });
  }),

  // 按教师查看评教（教师本人或 admin 可查）
  http.get("/api/evaluations/teacher/:teacherId", ({ params, request }) => {
    const caller = getUserFromRequest(request);
    const teacherId = Number(params.teacherId);
    if (!caller || (caller.role !== "admin" && caller.id !== teacherId)) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    return HttpResponse.json(
      counterEvaluations.filter((e) => e.teacherId === teacherId),
    );
  }),

  // 按课程查看评教（admin 或授课教师可查）
  http.get("/api/evaluations/course/:courseId", ({ params, request }) => {
    const caller = getUserFromRequest(request);
    if (!caller) {
      return HttpResponse.json({ error: "未登录" }, { status: 401 });
    }
    const courseId = Number(params.courseId);
    const course = courses.find((c) => c.id === courseId);
    // admin 可查任意课程，教师只能查自己教的课程
    if (
      caller.role !== "admin" &&
      (!course || course.teacherId !== caller.id)
    ) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    return HttpResponse.json(
      counterEvaluations.filter((e) => e.courseId === courseId),
    );
  }),
];
