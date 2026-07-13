import type { TimeSlot } from "@/types";
import { WEEKDAYS } from "@/constants";

/**
 * 将 TimeSlot 数组格式化为中文时间段字符串
 * @example formatTimeSlots([{ day: 1, start: 1, duration: 2 }])
 *          → "周一 1-2节"
 */
export function formatTimeSlots(slots: TimeSlot[]): string {
  return slots
    .map((s) => `${WEEKDAYS[s.day - 1]} ${s.start}-${s.start + s.duration - 1}节`)
    .join("、");
}
