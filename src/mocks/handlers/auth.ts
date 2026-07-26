import { http, HttpResponse } from "msw";
import { users } from "../data";

function sanitize(u: (typeof users)[number]) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safe } = u;
  return safe;
}

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as { account: string; password: string };

    const user = users.find((u) => {
      const byUserId = u.userId === body.account;
      const byName = u.name === body.account;
      return (byUserId || byName) && u.password === body.password;
    });

    if (!user) {
      return HttpResponse.json(
        { error: "账号或密码错误" },
        { status: 401 },
      );
    }

    const token = `mock-jwt-${user.id}-${Date.now()}`;

    return HttpResponse.json({
      token,
      user: sanitize(user),
    });
  }),

  // 修改密码
  http.post("/api/auth/change-password", async ({ request }) => {
    const body = (await request.json()) as {
      userId: number;
      oldPassword: string;
      newPassword: string;
    };

    const user = users.find((u) => u.id === body.userId);
    if (!user) {
      return HttpResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    if (user.password !== body.oldPassword) {
      return HttpResponse.json({ error: "原密码错误" }, { status: 400 });
    }

    user.password = body.newPassword;
    return HttpResponse.json({ success: true });
  }),

  // 发送重置密码验证码
  http.post("/api/auth/send-reset-code", async ({ request }) => {
    const body = (await request.json()) as { account: string };
    const user = users.find(
      (u) => u.userId === body.account || u.email === body.account || u.name === body.account,
    );
    if (!user) {
      return HttpResponse.json({ error: "账号不存在" }, { status: 404 });
    }
    return HttpResponse.json({ success: true, code: "123456" });
  }),

  // 重置密码
  http.post("/api/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as {
      account: string;
      code: string;
      newPassword: string;
    };
    if (body.code !== "123456") {
      return HttpResponse.json({ error: "验证码错误" }, { status: 400 });
    }
    const user = users.find(
      (u) => u.userId === body.account || u.email === body.account || u.name === body.account,
    );
    if (!user) {
      return HttpResponse.json({ error: "账号不存在" }, { status: 404 });
    }
    user.password = body.newPassword;
    return HttpResponse.json({ success: true });
  }),
];
