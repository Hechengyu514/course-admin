import client from "./client";
import type { LogEntry } from "@/types";

export async function getLogsAPI(): Promise<LogEntry[]> {
  const res = await client.get("/logs");
  return res.data;
}

export async function addLogAPI(data: {
  userId: number;
  userName: string;
  action: string;
  detail: string;
}): Promise<void> {
  await client.post("/logs", data);
}
