// 学期
export const SEMESTERS = ["2025-2026-2", "2026-2027-1", "2026-2027-2"] as const;

// 当前学期
export const CURRENT_SEMESTER = "2026-2027-1";

// 课程分类
export const CATEGORIES = ["必修", "选修", "通识"] as const;

// 学分上限
export const MAX_CREDITS = 28;

// 教学总周数
export const TOTAL_TEACHING_WEEKS = 16;

// 星期
export const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五"] as const;

// 节次
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

// 上课时间预设（day-start-duration-startWeek-endWeek）
export const TIME_PRESETS = [1, 2, 3, 4, 5].flatMap((day) =>
  [1, 3, 5, 7].map((start) => {
    const dayName = ["一", "二", "三", "四", "五"][day - 1];
    return {
      value: `${day}-${start}-2-1-16`,
      label: `周${dayName} ${start}-${start + 1}节（全学期）`,
    };
  }),
);

/** timeSlotKeys[] → TimeSlot[] */
export function parseTimeSlots(keys?: string[]): import("@/types").TimeSlot[] {
  if (!keys) return [{ day: 1, start: 1, duration: 2, startWeek: 1, endWeek: 16 } as import("@/types").TimeSlot];
  return keys.map((k) => {
    const parts = k.split("-").map(Number);
    // 兼容旧格式 day-start-duration 和新格式 day-start-duration-startWeek-endWeek
    return {
      day: parts[0] as 1 | 2 | 3 | 4 | 5,
      start: parts[1]!,
      duration: parts[2]!,
      startWeek: parts[3] ?? 1,
      endWeek: parts[4] ?? 16,
    };
  });
}

/** TimeSlot[] → timeSlotKeys[]（回填表单用） */
export function timeSlotsToKeys(slots: { day: number; start: number; duration: number; startWeek?: number; endWeek?: number }[]): string[] {
  return slots.map((s) => `${s.day}-${s.start}-${s.duration}-${s.startWeek ?? 1}-${s.endWeek ?? 16}`);
}
