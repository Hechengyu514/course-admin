import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ScheduleViewMode = "teacher" | "classroom";

interface ScheduleViewState {
  viewMode: ScheduleViewMode;
  selectedTeacherId?: number;
  selectedClassroom?: string;
  setViewMode: (mode: ScheduleViewMode) => void;
  setSelectedTeacherId: (id?: number) => void;
  setSelectedClassroom: (room?: string) => void;
}

export const useScheduleViewStore = create<ScheduleViewState>()(
  persist(
    (set) => ({
      viewMode: "teacher",
      selectedTeacherId: undefined,
      selectedClassroom: undefined,

      setViewMode: (mode) =>
        set({ viewMode: mode, selectedTeacherId: undefined, selectedClassroom: undefined }),
      setSelectedTeacherId: (id) => set({ selectedTeacherId: id }),
      setSelectedClassroom: (room) => set({ selectedClassroom: room }),
    }),
    { name: "schedule-view-store" },
  ),
);
