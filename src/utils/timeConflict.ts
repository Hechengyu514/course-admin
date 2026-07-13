import type { TimeSlot } from "@/types";

/**
 * 判断两组时间段是否有重叠（同一天 + 时间区间相交）
 *
 * @example
 *   hasConflict([{ day:1, start:1, duration:2 }], [{ day:1, start:2, duration:2 }])
 *   → true  （周一 1-2节 和 周一 2-3节 重叠）
 */
export function hasConflict(a: TimeSlot[], b: TimeSlot[]): boolean {
  return a.some((s1) =>
    b.some(
      (s2) =>
        s1.day === s2.day &&
        s1.start < s2.start + s2.duration &&
        s2.start < s1.start + s1.duration,
    ),
  );
}
