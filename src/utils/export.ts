import * as XLSX from "xlsx";

// 通用 Excel 导出
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T & string; title: string }[],
  filename: string,
): void {
  const headers = columns.map((c) => c.title);
  const rows = data.map((row) => columns.map((c) => String(row[c.key] ?? "")));
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // 自适应列宽（空数据时使用表头宽度）
  const colWidths = headers.map((h, i) => {
    const dataMax =
      rows.length > 0
        ? Math.max(...rows.map((r) => String(r[i] ?? "").length * 2))
        : 0;
    return { wch: Math.max(h.length * 2, dataMax) };
  });
  sheet["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// 成绩专用导出
export function exportGradesToExcel(
  rows: {
    courseName: string;
    credits: number;
    score: number;
    gpa: number | string;
  }[],
  semester?: string,
): void {
  const filename = semester ? `成绩单-${semester}` : "成绩单";
  exportToExcel(
    rows.map((r) => ({
      ...r,
      gpa: typeof r.gpa === "number" ? r.gpa.toFixed(1) : r.gpa,
    })),
    [
      { key: "courseName", title: "课程名" },
      { key: "credits", title: "学分" },
      { key: "score", title: "百分制成绩" },
      { key: "gpa", title: "GPA" },
    ],
    filename,
  );
}
