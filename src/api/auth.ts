import client from "./client";
import type { User } from "@/types";

interface LoginResponse {
  token: string;
  user: User;
}

export async function loginAPI(account: string, password: string): Promise<LoginResponse> {
  const res = await client.post("/auth/login", { account, password });
  return res.data;
}

export async function changePasswordAPI(
  userId: number,
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  await client.post("/auth/change-password", { userId, oldPassword, newPassword });
}

export async function sendResetCodeAPI(account: string): Promise<void> {
  await client.post("/auth/send-reset-code", { account });
}

export async function resetPasswordAPI(
  account: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await client.post("/auth/reset-password", { account, code, newPassword });
}
