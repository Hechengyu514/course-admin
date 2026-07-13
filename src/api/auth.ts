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
