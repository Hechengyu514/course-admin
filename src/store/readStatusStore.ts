import { create } from "zustand";

interface ReadStatusState {
  readIds: number[];
  markAsRead: (id: number) => void;
  markAllAsRead: (ids: number[]) => void;
  isRead: (id: number) => boolean;
  reset: () => void;
}

export const useReadStatusStore = create<ReadStatusState>()((set, get) => ({
  readIds: [],
  markAsRead: (id) =>
    set((state) => ({
      readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
    })),
  markAllAsRead: (ids) =>
    set((state) => {
      const set = new Set(state.readIds);
      ids.forEach((id) => set.add(id));
      return { readIds: [...set] };
    }),
  isRead: (id) => get().readIds.includes(id),
  reset: () => set({ readIds: [] }),
}));
