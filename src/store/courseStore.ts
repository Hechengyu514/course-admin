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
        await enrollAPI(courseId, studentId);
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
      },

      dropCourse: async (courseId, studentId) => {
        await dropAPI(courseId, studentId);
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
      },
    }),
    { name: "course-store" },
  ),
);
