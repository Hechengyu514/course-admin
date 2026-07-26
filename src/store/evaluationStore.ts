import { create } from "zustand";
import type { Evaluation } from "@/types";
import {
  getMyEvaluationsAPI,
  submitEvaluationAPI,
  getEvaluationsByTeacherAPI,
  getEvaluationsByCourseAPI,
} from "@/api/evaluations";

interface EvaluationState {
  myEvaluations: Evaluation[];
  viewedEvaluations: Evaluation[];
  // 当前查看的数据来源，避免两个查询互相覆盖
  viewedSource: "teacher" | "course" | null;
  fetchMyEvaluations: (studentId: number) => Promise<void>;
  submitEvaluation: (data: {
    courseId: number;
    studentId: number;
    teacherId: number;
    courseName: string;
    semester: string;
    score: number;
    comment: string;
  }) => Promise<void>;
  fetchByTeacher: (teacherId: number) => Promise<void>;
  fetchByCourse: (courseId: number) => Promise<void>;
  loading: boolean;
}

export const useEvaluationStore = create<EvaluationState>()((set) => ({
  myEvaluations: [],
  viewedEvaluations: [],
  viewedSource: null,
  loading: false,

  fetchMyEvaluations: async (studentId) => {
    set({ loading: true });
    try {
      const items = await getMyEvaluationsAPI(studentId);
      set({ myEvaluations: items });
    } finally {
      set({ loading: false });
    }
  },

  submitEvaluation: async (data) => {
    const item = await submitEvaluationAPI(data);
    set((state) => ({ myEvaluations: [...state.myEvaluations, item] }));
  },

  fetchByTeacher: async (teacherId) => {
    set({ loading: true });
    try {
      const items = await getEvaluationsByTeacherAPI(teacherId);
      set({ viewedEvaluations: items, viewedSource: "teacher" });
    } finally {
      set({ loading: false });
    }
  },

  fetchByCourse: async (courseId) => {
    set({ loading: true });
    try {
      const items = await getEvaluationsByCourseAPI(courseId);
      set({ viewedEvaluations: items, viewedSource: "course" });
    } finally {
      set({ loading: false });
    }
  },
}));
