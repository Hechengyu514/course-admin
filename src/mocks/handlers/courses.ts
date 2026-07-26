import { http, HttpResponse } from "msw";
import { courses, counters, users, pushLog, requireRole } from "../data";
import type { Course, TimeSlot } from "@/types";

export const courseHandlers = [
  // 获取全部课程（所有角色可读）
  http.get("/api/courses", () => {
    return HttpResponse.json(courses);
  }),

  // 获取单个课程（所有角色可读）
  http.get("/api/courses/:id", ({ params }) => {
    const id = Number(params.id);
    const course = courses.find((c) => c.id === id);
    if (!course) {
      return HttpResponse.json({ error: "课程不存在" }, { status: 404 });
    }
    return HttpResponse.json(course);
  }),

  // 新建课程（仅 admin）
  http.post("/api/courses", async ({ request }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅管理员可创建课程" },
        { status: 403 },
      );
    }
    const body = (await request.json()) as Partial<Course> & {
      timeSlotKeys?: string[];
    };
    const newCourse: Course = {
      id: counters.course++,
      name: body.name ?? "",
      category: body.category ?? "选修",
      credits: body.credits ?? 2,
      semester: body.semester ?? "2026-2027-1",
      teacherId: body.teacherId ?? 2,
      teacherName:
        body.teacherName ??
        users.find((u) => u.id === (body.teacherId ?? 2))?.name ??
        "",
      timeSlots: (body.timeSlots as TimeSlot[]) ?? [
        { day: 1, start: 1, duration: 2 },
      ],
      classroom: body.classroom ?? "",
      capacity: body.capacity ?? 30,
      studentIds: [],
      enrolledCount: 0,
    };
    courses.push(newCourse);
    pushLog(
      caller.id,
      caller.name,
      "新增课程",
      `创建了课程「${newCourse.name}」`,
    );
    return HttpResponse.json(newCourse, { status: 201 });
  }),

  // 编辑课程（仅 admin）
  http.put("/api/courses/:id", async ({ request, params }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅管理员可编辑课程" },
        { status: 403 },
      );
    }
    const id = Number(params.id);
    const body = (await request.json()) as Partial<Course>;
    const idx = courses.findIndex((c) => c.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: "课程不存在" }, { status: 404 });
    }
    const old = courses[idx]!;
    courses[idx] = { ...old, ...body, id };
    pushLog(
      caller.id,
      caller.name,
      "修改课程",
      `修改了课程「${old.name}」的信息`,
    );
    return HttpResponse.json(courses[idx]);
  }),

  // 删除课程（仅 admin）
  http.delete("/api/courses/:id", ({ request, params }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅管理员可删除课程" },
        { status: 403 },
      );
    }
    const id = Number(params.id);
    const idx = courses.findIndex((c) => c.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: "课程不存在" }, { status: 404 });
    }
    const removed = courses[idx]!;
    courses.splice(idx, 1);
    pushLog(
      caller.id,
      caller.name,
      "删除课程",
      `删除了课程「${removed.name}」`,
    );
    return HttpResponse.json(null, { status: 204 });
  }),

  // 选课（仅 student）
  http.post("/api/courses/:id/enroll", async ({ request, params }) => {
    const caller = requireRole(request, "student");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅学生可进行选课操作" },
        { status: 403 },
      );
    }
    const id = Number(params.id);
    const course = courses.find((c) => c.id === id);
    if (!course) {
      return HttpResponse.json({ error: "课程不存在" }, { status: 404 });
    }
    if (course.studentIds.includes(caller.id)) {
      return HttpResponse.json({ error: "已选过该课程" }, { status: 400 });
    }
    if (course.enrolledCount >= course.capacity) {
      return HttpResponse.json({ error: "课程已满" }, { status: 400 });
    }
    course.studentIds.push(caller.id);
    course.enrolledCount = course.studentIds.length;
    pushLog(caller.id, caller.name, "选课", `选修了课程「${course.name}」`);
    return HttpResponse.json({ success: true });
  }),

  // 退课（仅 student）
  http.post("/api/courses/:id/drop", async ({ request, params }) => {
    const caller = requireRole(request, "student");
    if (!caller) {
      return HttpResponse.json(
        { error: "无权限：仅学生可进行退课操作" },
        { status: 403 },
      );
    }
    const id = Number(params.id);
    const course = courses.find((c) => c.id === id);
    if (!course) {
      return HttpResponse.json({ error: "课程不存在" }, { status: 404 });
    }
    course.studentIds = course.studentIds.filter((sid) => sid !== caller.id);
    course.enrolledCount = course.studentIds.length;
    pushLog(caller.id, caller.name, "退课", `退选了课程「${course.name}」`);
    return HttpResponse.json({ success: true });
  }),
];
