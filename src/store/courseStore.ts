import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course } from "@/types";
import {
  getAllCourseAPI,
  createCourseAPI,
  updateCourseAPI,
  deleteCourseAPI,
  enrollAPI,
  dropAPI,
} from "@/api/courses";

// ========== 课程状态管理 ==========

interface CourseState {
  courses: Course[];
  fetchCourses: () => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  deleteCourse: (courseId: number) => Promise<void>;
  enrollCourse: (courseId: number, studentId: number) => Promise<void>;
  dropCourse: (courseId: number, studentId: number) => Promise<void>;
  restoreCourse: (course: Course) => Promise<void>;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set) => ({
      courses: [],

      fetchCourses: async () => {
        const courses = await getAllCourseAPI();
        set({ courses });
      },

      addCourse: async (course) => {
        const newCourse = await createCourseAPI(course);
        set((state) => ({ courses: [...state.courses, newCourse] }));
      },

      updateCourse: async (course) => {
        const updated = await updateCourseAPI(course.id, course);
        set((state) => ({
          courses: state.courses.map((c) => (c.id === course.id ? updated : c)),
        }));
      },

      deleteCourse: async (courseId) => {
        await deleteCourseAPI(courseId);
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== courseId),
        }));
      },

      enrollCourse: async (courseId, studentId) => {
        // 先乐观更新 UI，失败时回滚
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  studentIds: [...c.studentIds, studentId],
                  enrolledCount: c.enrolledCount + 1,
                }
              : c,
          ),
        }));
        try {
          await enrollAPI(courseId, studentId);
        } catch {
          // API 失败，回滚乐观更新
          set((state) => ({
            courses: state.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    studentIds: c.studentIds.filter((id) => id !== studentId),
                    enrolledCount: c.enrolledCount - 1,
                  }
                : c,
            ),
          }));
          throw new Error("选课失败");
        }
      },

      dropCourse: async (courseId, studentId) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  studentIds: c.studentIds.filter((id) => id !== studentId),
                  enrolledCount: c.enrolledCount - 1,
                }
              : c,
          ),
        }));
        try {
          await dropAPI(courseId, studentId);
        } catch {
          set((state) => ({
            courses: state.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    studentIds: [...c.studentIds, studentId],
                    enrolledCount: c.enrolledCount + 1,
                  }
                : c,
            ),
          }));
          throw new Error("退课失败");
        }
      },

      restoreCourse: async (course) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...courseData } = course;
        const restored = await createCourseAPI(courseData);
        set((state) => ({
          courses: [...state.courses, restored],
        }));
      },
    }),
    { name: "course-store" },
  ),
);
