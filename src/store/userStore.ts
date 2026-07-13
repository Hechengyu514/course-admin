import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { loginAPI } from "@/api/auth";
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

  // 登录：验证账号和密码，成功返回 true
  login: (account: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [],
      currentUser: null,

      login: async (account, password) => {
        try {
          const { token, user } = await loginAPI(account, password);
          localStorage.setItem("token", token);
          set({ currentUser: user });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ currentUser: null });
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
    }),
    { name: "user-store" },
  ),
);
