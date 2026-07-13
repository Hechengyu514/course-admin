// 学期
export const SEMESTERS = ["2025-2026-2", "2026-2027-1", "2026-2027-2"] as const;

// 当前学期
export const CURRENT_SEMESTER = "2026-2027-1";

// 课程分类
export const CATEGORIES = ["必修", "选修", "通识"] as const;

// 学分上限
export const MAX_CREDITS = 28;

// 星期
export const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五"] as const;

// 节次
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

// 上课时间预设（day-start-duration）
export const TIME_PRESETS = [1, 2, 3, 4, 5].flatMap((day) =>
  [1, 3, 5, 7].map((start) => {
    const dayName = ["一", "二", "三", "四", "五"][day - 1];
    return { value: `${day}-${start}-2`, label: `周${dayName} ${start}-${start + 1}节` };
  }),
);

/** timeSlotKeys[] → TimeSlot[] */
export function parseTimeSlots(keys?: string[]): { day: number; start: number; duration: number }[] {
  if (!keys) return [{ day: 1, start: 1, duration: 2 }];
  return keys.map((k) => {
    const [day, start, duration] = k.split("-").map(Number);
    return { day, start, duration };
  });
}

/** TimeSlot[] → timeSlotKeys[]（回填表单用） */
export function timeSlotsToKeys(slots: { day: number; start: number; duration: number }[]): string[] {
  return slots.map((s) => `${s.day}-${s.start}-${s.duration}`);
}
