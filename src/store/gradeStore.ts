import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Grade } from "@/types";
import { getGradesAPI, batchSaveGradesAPI } from "@/api/grade";
import { calcGPA } from "@/utils/gpa";

// ========== 成绩状态管理 ==========

interface GradeState {
  grades: Grade[];
  fetchGrades: (studentId: number, semester?: string) => Promise<void>;
  // 批量保存成绩，相同课程下学生的旧成绩会被覆盖
  batchSaveGrades: (newGrades: Grade[]) => Promise<void>;
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set) => ({
      grades: [],

      fetchGrades: async (studentId, semester) => {
        const grades = await getGradesAPI(studentId, semester);
        set({ grades });
      },

      batchSaveGrades: async (newGrades) => {
        const saved = await batchSaveGradesAPI(newGrades);
        set((state) => {
          const keys = new Set(
            saved.map((g) => `${g.courseId}-${g.studentId}`),
          );
          const remaining = state.grades.filter(
            (g) => !keys.has(`${g.courseId}-${g.studentId}`),
          );
          return { grades: [...remaining, ...saved] };
        });
      },
    }),
    { name: "grade-store" },
  ),
);

export { calcGPA };
