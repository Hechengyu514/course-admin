import type { Course, TimeSlot } from "@/types";
import { hasConflict } from "./timeConflict";

/**
 * 检测教师时间冲突
 * @returns 与该教师有时间冲突的课程列表，空数组表示无冲突
 */
export function checkTeacherConflict(
  newTimeSlots: TimeSlot[],
  teacherId: number,
  allCourses: Course[],
  excludeCourseId?: number,
): Course[] {
  return allCourses.filter((c) => {
    if (c.teacherId !== teacherId) return false;
    if (excludeCourseId !== undefined && c.id === excludeCourseId) return false;
    return hasConflict(newTimeSlots, c.timeSlots);
  });
}

/**
 * 检测教室时间冲突
 * @returns 与该教室有时间冲突的课程列表，空数组表示无冲突
 */
export function checkClassroomConflict(
  newTimeSlots: TimeSlot[],
  classroom: string,
  allCourses: Course[],
  excludeCourseId?: number,
): Course[] {
  return allCourses.filter((c) => {
    if (c.classroom !== classroom) return false;
    if (excludeCourseId !== undefined && c.id === excludeCourseId) return false;
    return hasConflict(newTimeSlots, c.timeSlots);
  });
}

// 格式化冲突信息
export function formatConflictMessages(
  teacherConflicts: Course[],
  classroomConflicts: Course[],
): string[] {
  const msgs: string[] = [];
  if (teacherConflicts.length > 0) {
    msgs.push(
      `教师时间冲突：${teacherConflicts
        .map((c) => `「${c.name}」${formatBrief(c)}`)
        .join("、")}`,
    );
  }
  if (classroomConflicts.length > 0) {
    msgs.push(
      `教室占用冲突：${classroomConflicts
        .map((c) => `「${c.name}」${formatBrief(c)}`)
        .join("、")}`,
    );
  }
  return msgs;
}

function formatBrief(c: Course): string {
  const days = ["一", "二", "三", "四", "五"];
  const parts = c.timeSlots.map(
    (s) =>
      `周${days[s.day - 1] ?? s.day} ${s.start}-${s.start + s.duration - 1}节`,
  );
  return `(${parts.slice(0, 2).join(" ")})`;
}
