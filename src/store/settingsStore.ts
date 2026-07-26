import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  maxCredits: number;
  enrollmentStart: string;
  enrollmentEnd: string;
  announcementsEnabled: boolean;
  updateSettings: (settings: Partial<Omit<SettingsState, "updateSettings">>) => void;
}

const defaults = {
  maxCredits: 28,
  enrollmentStart: "2026-08-25",
  enrollmentEnd: "2026-09-15",
  announcementsEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    { name: "settings-store" },
  ),
);
