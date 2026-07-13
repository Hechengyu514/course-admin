// 百分制 → 5.0 制 GPA（低于60=0）
export function calcGPA(score: number): number {
  if (score < 60) return 0;
  const gpa = (score - 50) / 10;
  return Math.round(gpa * 10) / 10;
}
