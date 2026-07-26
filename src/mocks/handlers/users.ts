import { http, HttpResponse } from "msw";
import { users, counters, pushLog, getUserFromRequest, requireRole } from "../data";
import type { MockUser } from "../data";

function sanitize(u: MockUser): Omit<MockUser, "password"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = u;
  return safe;
}

export const userHandlers = [
  // 获取全部用户（仅 admin / teacher 可读，teacher 主要用于查看学生列表）
  http.get("/api/users", ({ request }) => {
    const caller = requireRole(request, "admin", "teacher");
    if (!caller) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    return HttpResponse.json(users.map(sanitize));
  }),

  // 新增用户（仅 admin）
  http.post("/api/users", async ({ request }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json({ error: "无权限：仅管理员可创建用户" }, { status: 403 });
    }
    const body = (await request.json()) as Partial<MockUser>;
    const newUser: MockUser = {
      id: counters.user++,
      userId: body.userId ?? `U${counters.user}`,
      name: body.name ?? "",
      role: body.role ?? "student",
      gender: body.gender ?? "男",
      department: body.department ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      enrolledYear: body.enrolledYear,
      classId: body.classId,
      className: body.className,
      password: "123456",
    };
    users.push(newUser);
    pushLog(caller.id, caller.name, "新增用户", `新增了${newUser.role === "student" ? "学生" : newUser.role === "teacher" ? "教师" : "用户"}「${newUser.name}」`);
    return HttpResponse.json(sanitize(newUser), { status: 201 });
  }),

  // 编辑用户（admin 可编辑任意用户，普通用户仅可编辑自己）
  http.put("/api/users/:id", async ({ request, params }) => {
    const caller = getUserFromRequest(request);
    if (!caller) {
      return HttpResponse.json({ error: "未登录" }, { status: 401 });
    }
    const id = Number(params.id);
    // 非 admin 用户只能编辑自己
    if (caller.role !== "admin" && caller.id !== id) {
      return HttpResponse.json({ error: "无权限" }, { status: 403 });
    }
    const body = (await request.json()) as Partial<MockUser>;
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    const u = users[idx]!;
    if (body.name !== undefined) u.name = body.name;
    if (body.userId !== undefined) u.userId = body.userId;
    if (body.gender !== undefined) u.gender = body.gender;
    if (body.department !== undefined) u.department = body.department;
    if (body.phone !== undefined) u.phone = body.phone;
    if (body.email !== undefined) u.email = body.email;
    if (body.enrolledYear !== undefined) u.enrolledYear = body.enrolledYear;
    if (body.classId !== undefined) u.classId = body.classId;
    if (body.className !== undefined) u.className = body.className;
    if (body.role !== undefined) u.role = body.role;
    pushLog(caller.id, caller.name, "修改用户", `修改了用户「${u.name}」的信息`);
    return HttpResponse.json(sanitize(u));
  }),

  // 删除用户（仅 admin）
  http.delete("/api/users/:id", ({ request, params }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json({ error: "无权限：仅管理员可删除用户" }, { status: 403 });
    }
    const id = Number(params.id);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) {
      return HttpResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    const removed = users[idx]!;
    users.splice(idx, 1);
    pushLog(caller.id, caller.name, "删除用户", `删除了用户「${removed.name}」`);
    return HttpResponse.json(null, { status: 204 });
  }),

  // 批量导入（仅 admin）
  http.post("/api/users/batch", async ({ request }) => {
    const caller = requireRole(request, "admin");
    if (!caller) {
      return HttpResponse.json({ error: "无权限：仅管理员可批量导入" }, { status: 403 });
    }
    const body = (await request.json()) as Partial<MockUser>[];
    const created: ReturnType<typeof sanitize>[] = [];
    for (const item of body) {
      const newUser: MockUser = {
        id: counters.user++,
        userId: item.userId ?? `U${counters.user}`,
        name: item.name ?? "",
        role: item.role ?? "student",
        gender: item.gender ?? "男",
        department: item.department ?? "",
        phone: item.phone ?? "",
        email: item.email ?? "",
        enrolledYear: item.enrolledYear,
        classId: item.classId,
        className: item.className,
        password: "123456",
      };
      users.push(newUser);
      created.push(sanitize(newUser));
    }
    pushLog(caller.id, caller.name, "新增用户", `批量导入了 ${created.length} 名用户`);
    return HttpResponse.json(created, { status: 201 });
  }),
];
