// 系统角色
export type Role = "admin" | "teacher" | "student";

// 班级
export interface Class {
  id: number;
  name: string;          // 班级名，如 "计科2401"
  department: string;    // 所属院系
  grade: number;         // 年级（入学年份），如 2024
  counselorId?: number;  // 辅导员（教师）ID
  counselorName?: string;
}

// 用户信息
export interface User {
  id: number;
  userId: string;          // 学号/工号，如 "202401001"
  name: string;
  role: Role;
  gender: string;
  department: string;
  phone: string;
  email: string;
  enrolledYear?: number;   // 入学年份（仅学生）
  classId?: number;        // 所属班级 ID（仅学生）
  className?: string;      // 班级名称冗余字段，方便展示
}

// 上课时间
export interface TimeSlot {
  day: 1 | 2 | 3 | 4 | 5;
  start: number;
  duration: number;
  startWeek: number;       // 起始教学周，默认 1
  endWeek: number;         // 结束教学周，默认 16
}

// 课程信息
export interface Course {
  id: number;
  name: string;
  category: string;
  credits: number;
  semester: string;
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

// 通知公告
export interface Announcement {
  id: number;
  title: string;
  content: string;
  publisherId: number;
  publisherName: string;
  createdAt: string;
  updatedAt: string;
}

// 评教
export interface Evaluation {
  id: number;
  courseId: number;
  courseName: string;
  studentId: number;
  studentName: string;
  teacherId: number;
  semester: string;
  score: number;
  comment: string;
  createdAt: string;
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
  mode?: "multiple";
}
