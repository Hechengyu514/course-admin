import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Semester = string;

interface SemesterState {
  currentSemester: string;
  setSemester: (semester: string) => void;
}

export const useSemesterStore = create<SemesterState>()(
  persist(
    (set) => ({
      currentSemester: "2026-2027-1",
      setSemester: (semester) => set({ currentSemester: semester }),
    }),
    { name: "semester-store" },
  ),
);
