import { create } from "zustand";
import type { Class } from "@/types";
import { getClassesAPI } from "@/api/classes";

interface ClassState {
  classes: Class[];
  fetchClasses: () => Promise<void>;
}

export const useClassStore = create<ClassState>()((set) => ({
  classes: [],

  fetchClasses: async () => {
    const classes = await getClassesAPI();
    set({ classes });
  },
}));
