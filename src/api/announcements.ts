import client from "./client";
import type { Announcement } from "@/types";

export async function getAnnouncementsAPI(): Promise<Announcement[]> {
  const res = await client.get("/announcements");
  return res.data;
}

export async function createAnnouncementAPI(
  data: { title: string; content: string; publisherId: number },
): Promise<Announcement> {
  const res = await client.post("/announcements", data);
  return res.data;
}

export async function updateAnnouncementAPI(
  id: number,
  data: { title?: string; content?: string },
): Promise<Announcement> {
  const res = await client.put(`/announcements/${id}`, data);
  return res.data;
}

export async function deleteAnnouncementAPI(id: number): Promise<void> {
  await client.delete(`/announcements/${id}`);
}
