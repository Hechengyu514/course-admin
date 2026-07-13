// 系统角色
export type Role = "admin" | "teacher" | "student";

// 用户信息
export interface User {
  id: number;
  name: string;
  role: Role;
}

// 上课时间
export interface TimeSlot {
  day: 1 | 2 | 3 | 4 | 5;
  start: number;
  duration: number;
}

// 课程信息
export interface Course {
  id: number;
  name: string;
  category: string;
  credits: number;
  semester: string; // 学期，如2025-2026-2
  teacherId: number;
  teacherName?: string;
  timeSlots: TimeSlot[];
  classroom: string;
  capacity: number;
  studentIds: number[];
  enrolledCount: number;
}

// 成绩
export interface Grade {
  courseId: number;
  studentId: number;
  score: number;
  gpa: number;
  semester: string;
}

// 系统日志
export interface LogEntry {
  id: number;
  userId: number;
  userName: string;
  time: string;
  action: string;
  detail: string;
}

// 表单类型
export interface FormField {
  name: string;
  label: string;
  type: "input" | "number" | "select" | "textarea" | "disabled";
  required?: boolean;
  options?: { value: string | number; label: string }[];
  min?: number;
  max?: number;
  initialValue?: string;
  mode?: "multiple";  // Select 多选模式
}
