import type { Course } from "@/types";
import client from "./client";

export async function getAllCourseAPI(): Promise<Course[]> {
  const res = await client.get("/courses");
  return res.data;
}

export async function getCourseByIdAPI(courseId: number): Promise<Course> {
  const res = await client.get(`/courses/${courseId}`);
  return res.data;
}

export async function createCourseAPI(data: Partial<Course>): Promise<Course> {
  const res = await client.post("/courses", data);
  return res.data;
}

export async function updateCourseAPI(
  courseId: number,
  data: Partial<Course>,
): Promise<Course> {
  const res = await client.put(`/courses/${courseId}`, data);
  return res.data;
}

export async function deleteCourseAPI(courseId: number): Promise<void> {
  await client.delete(`/courses/${courseId}`);
}

export async function enrollAPI(
  courseId: number,
  studentId: number,
): Promise<void> {
  await client.post(`/courses/${courseId}/enroll`, { studentId });
}

export async function dropAPI(
  courseId: number,
  studentId: number,
): Promise<void> {
  await client.post(`/courses/${courseId}/drop`, { studentId });
}
