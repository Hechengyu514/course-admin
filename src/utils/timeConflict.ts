import type { TimeSlot } from "@/types";

/**
 * 判断两个时间段是否有重叠（同一天 + 时间区间相交 + 教学周有交集）
 *
 * @example
 *   hasConflict([{ day:1, start:1, duration:2, startWeek:1, endWeek:16 }],
 *               [{ day:1, start:2, duration:2, startWeek:1, endWeek:16 }])
 *   → true  （周一 1-2节 和 周一 2-3节 重叠）
 *
 * @example
 *   hasConflict([{ day:1, start:1, duration:2, startWeek:1, endWeek:8 }],
 *               [{ day:1, start:1, duration:2, startWeek:9, endWeek:16 }])
 *   → false （同一时段但不同教学周，不冲突）
 */
export function hasConflict(a: TimeSlot[], b: TimeSlot[]): boolean {
  return a.some((s1) =>
    b.some(
      (s2) =>
        s1.day === s2.day &&
        s1.start < s2.start + s2.duration &&
        s2.start < s1.start + s1.duration &&
        s1.startWeek <= s2.endWeek &&
        s2.startWeek <= s1.endWeek,
    ),
  );
}
