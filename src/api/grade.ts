import client from "./client";
import type { Grade } from "@/types";

export async function getGradesAPI(
  studentId: number,
  semester?: string,
): Promise<Grade[]> {
  const res = await client.get(`/grades/student/${studentId}`, {
    params: { semester },
  });
  return res.data;
}

export async function getGradesByCourseAPI(courseId: number): Promise<Grade[]> {
  const res = await client.get(`/grades/course/${courseId}`);
  return res.data;
}

export async function batchSaveGradesAPI(grades: Grade[]): Promise<Grade[]> {
  const res = await client.post("/grades/batch", grades);
  return res.data;
}
