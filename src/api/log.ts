import client from "./client";
import type { LogEntry } from "@/types";

export async function getLogsAPI(): Promise<LogEntry[]> {
  const res = await client.get("/logs");
  return res.data;
}
