import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { loginAPI, changePasswordAPI } from "@/api/auth";
import { restoreSnapshot, saveSnapshot } from "@/mocks/data";
import { useReadStatusStore } from "./readStatusStore";
import {
  createUserAPI,
  deleteUserAPI,
  getUsersAPI,
  updateUserAPI,
} from "@/api/users";

// ========== 用户状态管理 ==========

interface UserState {
  users: User[];
  currentUser: User | null;
  authError: string | null;

  login: (account: string, password: string) => Promise<{ success: true } | { success: false; error: string }>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  updateProfile: (user: User) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: true } | { success: false; error: string }>;
  clearAuthError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,
      authError: null,

      login: async (account, password) => {
        try {
          const { token, user } = await loginAPI(account, password);
          localStorage.setItem("token", token);
          set({ currentUser: user, authError: null });
          // 恢复共享数据快照（所有用户共享同一份数据）
          restoreSnapshot();
          return { success: true };
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
          const error = axiosErr?.response?.data?.error
            || axiosErr?.message
            || "登录失败";
          set({ authError: error });
          return { success: false, error };
        }
      },

      logout: () => {
        const user = get().currentUser;
        if (user) {
          saveSnapshot();          // 保存共享数据（刷新后恢复用）
        }
        localStorage.removeItem("token");
        set({ currentUser: null, authError: null });
        // 不清除内存数据，确保下个用户登录时看到相同的数据
        // 清空已读状态（避免跨账号泄漏）
        useReadStatusStore.getState().reset();
      },

      fetchUsers: async () => {
        const users = await getUsersAPI();
        set({ users });
      },

      addUser: async (user) => {
        const newUser = await createUserAPI(user);
        set((state) => ({ users: [...state.users, newUser] }));
      },

      updateUser: async (user) => {
        const updated = await updateUserAPI(user.id, user);
        set((state) => ({
          users: state.users.map((u) => (u.id === user.id ? updated : u)),
        }));
      },

      deleteUser: async (id) => {
        await deleteUserAPI(id);
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      },

      updateProfile: async (user) => {
        const updated = await updateUserAPI(user.id, user);
        set((state) => ({
          currentUser: state.currentUser?.id === user.id ? updated : state.currentUser,
          users: state.users.map((u) => (u.id === user.id ? updated : u)),
        }));
      },

      changePassword: async (oldPassword, newPassword) => {
        const user = get().currentUser;
        if (!user) return { success: false, error: "未登录" };
        try {
          await changePasswordAPI(user.id, oldPassword, newPassword);
          return { success: true };
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { error?: string } }; message?: string };
          const error = axiosErr?.response?.data?.error
            || axiosErr?.message
            || "密码修改失败";
          set({ authError: error });
          return { success: false, error };
        }
      },

      clearAuthError: () => set({ authError: null }),
    }),
    { name: "user-store" },
  ),
);
