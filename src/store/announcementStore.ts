import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Announcement } from "@/types";
import {
  getAnnouncementsAPI,
  createAnnouncementAPI,
  updateAnnouncementAPI,
  deleteAnnouncementAPI,
} from "@/api/announcements";

interface AnnouncementState {
  announcements: Announcement[];
  fetchAnnouncements: () => Promise<void>;
  addAnnouncement: (data: { title: string; content: string; publisherId: number }) => Promise<void>;
  updateAnnouncement: (id: number, data: { title?: string; content?: string }) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set) => ({
      announcements: [],

      fetchAnnouncements: async () => {
        const items = await getAnnouncementsAPI();
        set({ announcements: items });
      },

      addAnnouncement: async (data) => {
        const item = await createAnnouncementAPI(data);
        set((state) => ({ announcements: [item, ...state.announcements] }));
      },

      updateAnnouncement: async (id, data) => {
        const updated = await updateAnnouncementAPI(id, data);
        set((state) => ({
          announcements: state.announcements.map((a) =>
            a.id === id ? updated : a,
          ),
        }));
      },

      deleteAnnouncement: async (id) => {
        await deleteAnnouncementAPI(id);
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        }));
      },
    }),
    { name: "announcement-store" },
  ),
);
