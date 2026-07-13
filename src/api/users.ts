import client from "./client";
import type { User } from "@/types";

export async function getUsersAPI(): Promise<User[]> {
  const res = await client.get("/users");
  return res.data;
}

export async function createUserAPI(data: Partial<User>): Promise<User> {
  const res = await client.post("/users", data);
  return res.data;
}

export async function updateUserAPI(
  id: number,
  data: Partial<User>,
): Promise<User> {
  const res = await client.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUserAPI(id: number): Promise<void> {
  await client.delete(`/users/${id}`);
}
