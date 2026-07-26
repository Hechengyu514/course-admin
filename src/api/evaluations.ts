import client from "./client";
import type { Evaluation } from "@/types";

export async function getMyEvaluationsAPI(studentId: number): Promise<Evaluation[]> {
  const res = await client.get(`/evaluations/student/${studentId}`);
  return res.data;
}

export async function getPendingEvaluationsAPI(studentId: number): Promise<number[]> {
  const res = await client.get(`/evaluations/pending/${studentId}`);
  return res.data;
}

export async function submitEvaluationAPI(data: {
  courseId: number;
  studentId: number;
  teacherId: number;
  courseName: string;
  semester: string;
  score: number;
  comment: string;
}): Promise<Evaluation> {
  const res = await client.post("/evaluations", data);
  return res.data;
}

export async function getEvaluationsByTeacherAPI(teacherId: number): Promise<Evaluation[]> {
  const res = await client.get(`/evaluations/teacher/${teacherId}`);
  return res.data;
}

export async function getEvaluationsByCourseAPI(courseId: number): Promise<Evaluation[]> {
  const res = await client.get(`/evaluations/course/${courseId}`);
  return res.data;
}
