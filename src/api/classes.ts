import client from "./client";
import type { Class } from "@/types";

export async function getClassesAPI(): Promise<Class[]> {
  const res = await client.get("/classes");
  return res.data;
}

export async function getClassByIdAPI(id: number): Promise<Class> {
  const res = await client.get(`/classes/${id}`);
  return res.data;
}
