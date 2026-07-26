import { faker } from "@faker-js/faker";
import type {
  User,
  Course,
  Grade,
  LogEntry,
  Announcement,
  Class,
  TimeSlot,
  Evaluation,
} from "@/types";

faker.seed(2026);

export interface MockUser extends User {
  password: string;
}

// ============================================================
//  工具函数
// ============================================================
const SURN = [
  "赵",
  "钱",
  "孙",
  "李",
  "周",
  "吴",
  "郑",
  "王",
  "冯",
  "陈",
  "褚",
  "卫",
  "蒋",
  "沈",
  "韩",
  "杨",
  "朱",
  "秦",
  "尤",
  "许",
  "何",
  "吕",
  "施",
  "张",
  "孔",
  "曹",
  "严",
  "华",
  "金",
  "魏",
  "陶",
  "姜",
  "戚",
  "谢",
  "邹",
  "喻",
  "柏",
  "水",
  "窦",
  "章",
  "云",
  "苏",
  "潘",
  "葛",
  "奚",
  "范",
  "彭",
  "郎",
  "鲁",
  "韦",
  "昌",
  "马",
  "苗",
  "凤",
  "花",
  "方",
  "俞",
  "任",
  "袁",
  "柳",
];
const GIVEN_M = [
  "伟",
  "强",
  "军",
  "磊",
  "洋",
  "勇",
  "杰",
  "涛",
  "明",
  "超",
  "华",
  "林",
  "鹏",
  "飞",
  "宇",
  "浩",
  "然",
  "博",
  "文",
  "志",
];
const GIVEN_F = [
  "芳",
  "婷",
  "静",
  "敏",
  "丽",
  "娟",
  "雪",
  "倩",
  "娜",
  "颖",
  "慧",
  "琳",
  "玲",
  "萍",
  "怡",
  "莹",
  "洁",
  "兰",
  "云",
  "佳",
];

function genStudentName(i: number): { name: string; gender: string } {
  const gender = i % 2 === 0 ? "男" : "女";
  const s = SURN[i % SURN.length]!;
  // 使用质数步进来避免姓名循环重复（LCM 远大于 240）
  const g =
    gender === "男"
      ? GIVEN_M[(i * 7) % GIVEN_M.length]!
      : GIVEN_F[(i * 11) % GIVEN_F.length]!;
  return { name: s + g, gender };
}

function genPhone(i: number): string {
  return `139${String(10000000 + i).slice(0, 8)}`;
}
function genEmail(name: string, i: number): string {
  return `s${name + i}@edu.cn`;
}

// ============================================================
//  1. 班级（6 个，每班 40 人）
// ============================================================
export const classes: Class[] = [
  {
    id: 1,
    name: "计科2401",
    department: "计算机科学与技术学院",
    grade: 2024,
    counselorId: 2,
    counselorName: "张教授",
  },
  {
    id: 2,
    name: "计科2402",
    department: "计算机科学与技术学院",
    grade: 2024,
    counselorId: 3,
    counselorName: "李教授",
  },
  {
    id: 3,
    name: "软工2401",
    department: "软件工程学院",
    grade: 2024,
    counselorId: 4,
    counselorName: "刘教授",
  },
  {
    id: 4,
    name: "软工2402",
    department: "软件工程学院",
    grade: 2024,
    counselorId: 5,
    counselorName: "黄教授",
  },
  {
    id: 5,
    name: "人智2401",
    department: "人工智能学院",
    grade: 2024,
    counselorId: 6,
    counselorName: "朱教授",
  },
  {
    id: 6,
    name: "人智2402",
    department: "人工智能学院",
    grade: 2024,
    counselorId: 7,
    counselorName: "郑教授",
  },
];

// ============================================================
//  2. 用户
// ============================================================
let uid = 0;
function nextId() {
  return ++uid;
}

// --- 管理员 ---
const ADMIN: MockUser = {
  id: nextId(),
  userId: "admin001",
  name: "系统管理员",
  role: "admin",
  gender: "男",
  department: "教务处",
  phone: "13800000001",
  email: "admin@edu.cn",
  password: "admin123",
};

// --- 36 位教师 ---
// 15 位公共基础课教师（5 门 × 3）
//  6 位专业必修课教师（2 门 × 3 专业）
// 15 位公选课教师
function makeTeacher(
  userId: string,
  name: string,
  department: string,
): MockUser {
  return {
    id: nextId(),
    userId,
    name,
    role: "teacher",
    gender: "男",
    department,
    phone: `138${String(10000000 + uid).slice(0, 8)}`,
    email: `${userId.toLowerCase()}@edu.cn`,
    password: "123456",
  };
}

const TEACHER_DEFS: { userId: string; name: string; department: string }[] = [
  // 公共基础课（5 门）—— 一门课一个老师教六个班
  { userId: "T1001", name: "张教授", department: "数学与统计学院" }, // 高等数学
  { userId: "T1002", name: "李教授", department: "数学与统计学院" }, // 线性代数
  { userId: "T1003", name: "刘教授", department: "外国语学院" }, // 大学英语
  { userId: "T1004", name: "黄教授", department: "计算机科学与技术学院" }, // C语言
  { userId: "T1005", name: "朱教授", department: "马克思主义学院" }, // 思修
  // 专业必修课（6 门）
  { userId: "T2001", name: "郑教授", department: "计算机科学与技术学院" },
  { userId: "T2002", name: "谢教授", department: "计算机科学与技术学院" },
  { userId: "T2003", name: "韩教授", department: "软件工程学院" },
  { userId: "T2004", name: "唐教授", department: "软件工程学院" },
  { userId: "T2005", name: "冯教授", department: "人工智能学院" },
  { userId: "T2006", name: "董教授", department: "人工智能学院" },
  // 公选课（15 门）
  { userId: "T3001", name: "萧老师", department: "艺术学院" },
  { userId: "T3002", name: "程老师", department: "艺术学院" },
  { userId: "T3003", name: "曹老师", department: "艺术学院" },
  { userId: "T3004", name: "袁老师", department: "音乐学院" },
  { userId: "T3005", name: "邓老师", department: "音乐学院" },
  { userId: "T3006", name: "许老师", department: "外国语学院" },
  { userId: "T3007", name: "傅老师", department: "人文学院" },
  { userId: "T3008", name: "沈老师", department: "人文学院" },
  { userId: "T3009", name: "曾老师", department: "物理学院" },
  { userId: "T3010", name: "彭老师", department: "数学与统计学院" },
  { userId: "T3011", name: "吕老师", department: "环境学院" },
  { userId: "T3012", name: "苏老师", department: "人文学院" },
  { userId: "T3013", name: "卢老师", department: "人文学院" },
  { userId: "T3014", name: "蒋老师", department: "医学院" },
  { userId: "T3015", name: "蔡老师", department: "计算机科学与技术学院" },
];

const TEACHERS: MockUser[] = TEACHER_DEFS.map((d) =>
  makeTeacher(d.userId, d.name, d.department),
);

// --- 240 名学生 ---
function makeStudents(
  classId: number,
  className: string,
  department: string,
  startIdx: number,
): MockUser[] {
  const arr: MockUser[] = [];
  for (let i = 0; i < 40; i++) {
    const { name, gender } = genStudentName(startIdx + i);
    arr.push({
      id: nextId(),
      userId: `2024${String(1000 + startIdx + i).slice(0, 4)}`,
      name,
      role: "student",
      gender,
      department,
      phone: genPhone(startIdx + i),
      email: genEmail(name, startIdx + i),
      enrolledYear: 2024,
      classId,
      className,
      password: "123456",
    });
  }
  return arr;
}

const CS1_STUDENTS = makeStudents(1, "计科2401", "计算机科学与技术学院", 0);
const CS2_STUDENTS = makeStudents(2, "计科2402", "计算机科学与技术学院", 40);
const SE1_STUDENTS = makeStudents(3, "软工2401", "软件工程学院", 80);
const SE2_STUDENTS = makeStudents(4, "软工2402", "软件工程学院", 120);
const AI1_STUDENTS = makeStudents(5, "人智2401", "人工智能学院", 160);
const AI2_STUDENTS = makeStudents(6, "人智2402", "人工智能学院", 200);

const ALL_STUDENTS = [
  ...CS1_STUDENTS,
  ...CS2_STUDENTS,
  ...SE1_STUDENTS,
  ...SE2_STUDENTS,
  ...AI1_STUDENTS,
  ...AI2_STUDENTS,
];
const CS_ALL = [...CS1_STUDENTS, ...CS2_STUDENTS]; // 80人
const SE_ALL = [...SE1_STUDENTS, ...SE2_STUDENTS]; // 80人
const AI_ALL = [...AI1_STUDENTS, ...AI2_STUDENTS]; // 80人
const ALL_IDS = (arr: MockUser[]) => arr.map((u) => u.id);

export const users: MockUser[] = [ADMIN, ...TEACHERS, ...ALL_STUDENTS];

// ============================================================
//  3. 课程（36 门）
// ============================================================
let cid = 0;
function cidNext() {
  return ++cid;
}

const SEM = "2026-2027-1"; // 当前学期
const SW = 1,
  EW = 16; // 教学周 1-16

function ts(day: TimeSlot["day"], start: number, dur = 2): TimeSlot {
  return { day, start, duration: dur, startWeek: SW, endWeek: EW };
}

// --- 公共基础课（5 门，一个老师教全校） ---
//  高数(一1-2/三3-4) 线代(二1-2) 英语(四1-2) C(二3-4/五1-2) 思修(三1-2/五3-4)

const c_gd: Course = {
  id: cidNext(),
  name: "高等数学",
  category: "必修",
  credits: 5,
  semester: SEM,
  teacherId: TEACHERS[0]!.id,
  teacherName: TEACHERS[0]!.name,
  timeSlots: [ts(1, 1), ts(3, 3)],
  classroom: "报告厅 A",
  capacity: 260,
  studentIds: ALL_IDS(ALL_STUDENTS),
  enrolledCount: 240,
};

const c_xd: Course = {
  id: cidNext(),
  name: "线性代数",
  category: "必修",
  credits: 3,
  semester: SEM,
  teacherId: TEACHERS[1]!.id,
  teacherName: TEACHERS[1]!.name,
  timeSlots: [ts(2, 1)],
  classroom: "报告厅 A",
  capacity: 260,
  studentIds: ALL_IDS(ALL_STUDENTS),
  enrolledCount: 240,
};

const c_yy: Course = {
  id: cidNext(),
  name: "大学英语",
  category: "必修",
  credits: 2,
  semester: SEM,
  teacherId: TEACHERS[2]!.id,
  teacherName: TEACHERS[2]!.name,
  timeSlots: [ts(4, 1)],
  classroom: "报告厅 A",
  capacity: 260,
  studentIds: ALL_IDS(ALL_STUDENTS),
  enrolledCount: 240,
};

const c_cl: Course = {
  id: cidNext(),
  name: "C语言程序设计",
  category: "必修",
  credits: 3,
  semester: SEM,
  teacherId: TEACHERS[3]!.id,
  teacherName: TEACHERS[3]!.name,
  timeSlots: [ts(2, 3), ts(5, 1)],
  classroom: "机房 A+B+C",
  capacity: 260,
  studentIds: ALL_IDS(ALL_STUDENTS),
  enrolledCount: 240,
};

const c_sx: Course = {
  id: cidNext(),
  name: "思想道德与法治",
  category: "必修",
  credits: 3,
  semester: SEM,
  teacherId: TEACHERS[4]!.id,
  teacherName: TEACHERS[4]!.name,
  timeSlots: [ts(3, 1), ts(5, 3)],
  classroom: "报告厅 A",
  capacity: 260,
  studentIds: ALL_IDS(ALL_STUDENTS),
  enrolledCount: 240,
};

// --- 专业必修课（6 门）---
// 计科
const c_jz: Course = {
  id: cidNext(),
  name: "计算机组成原理",
  category: "必修",
  credits: 3,
  semester: SEM,
  teacherId: TEACHERS[5]!.id,
  teacherName: TEACHERS[5]!.name,
  timeSlots: [ts(1, 3)],
  classroom: "教一 401",
  capacity: 120,
  studentIds: ALL_IDS(CS_ALL),
  enrolledCount: 80,
};
const c_by: Course = {
  id: cidNext(),
  name: "编译原理",
  category: "必修",
  credits: 2,
  semester: SEM,
  teacherId: TEACHERS[6]!.id,
  teacherName: TEACHERS[6]!.name,
  timeSlots: [ts(4, 3)],
  classroom: "教一 402",
  capacity: 120,
  studentIds: ALL_IDS(CS_ALL),
  enrolledCount: 80,
};

// 软工
const c_se_intro: Course = {
  id: cidNext(),
  name: "软件工程导论",
  category: "必修",
  credits: 2,
  semester: SEM,
  teacherId: TEACHERS[7]!.id,
  teacherName: TEACHERS[7]!.name,
  timeSlots: [ts(1, 3)],
  classroom: "教二 401",
  capacity: 120,
  studentIds: ALL_IDS(SE_ALL),
  enrolledCount: 80,
};
const c_se_test: Course = {
  id: cidNext(),
  name: "软件测试",
  category: "必修",
  credits: 3,
  semester: SEM,
  teacherId: TEACHERS[8]!.id,
  teacherName: TEACHERS[8]!.name,
  timeSlots: [ts(4, 5), ts(5, 5)],
  classroom: "教二 402",
  capacity: 120,
  studentIds: ALL_IDS(SE_ALL),
  enrolledCount: 80,
};

// 人智
const c_ai_intro: Course = {
  id: cidNext(),
  name: "人工智能导论",
  category: "必修",
  credits: 2,
  semester: SEM,
  teacherId: TEACHERS[9]!.id,
  teacherName: TEACHERS[9]!.name,
  timeSlots: [ts(1, 3)],
  classroom: "教三 401",
  capacity: 120,
  studentIds: ALL_IDS(AI_ALL),
  enrolledCount: 80,
};
const c_ml: Course = {
  id: cidNext(),
  name: "机器学习",
  category: "必修",
  credits: 3,
  semester: SEM,
  teacherId: TEACHERS[10]!.id,
  teacherName: TEACHERS[10]!.name,
  timeSlots: [ts(4, 5), ts(5, 3)],
  classroom: "教三 402",
  capacity: 120,
  studentIds: ALL_IDS(AI_ALL),
  enrolledCount: 80,
};

// --- 公共选修课（15 门）---
// 5×60人(1学分) + 5×90人(2学分) + 5×120人(2学分)
interface ElectiveDef {
  name: string;
  capacity: number;
  credits: number;
  classroom: string;
}
const ELECTIVE_DEFS: ElectiveDef[] = [
  { name: "影视鉴赏", capacity: 120, credits: 2, classroom: "公教 101" },
  { name: "美术鉴赏", capacity: 90, credits: 2, classroom: "公教 102" },
  { name: "摄影基础", capacity: 60, credits: 1, classroom: "公教 103" },
  { name: "音乐欣赏", capacity: 90, credits: 2, classroom: "公教 104" },
  { name: "心理学与生活", capacity: 120, credits: 2, classroom: "公教 105" },
  { name: "日语入门", capacity: 90, credits: 2, classroom: "公教 106" },
  { name: "书法基础", capacity: 60, credits: 1, classroom: "公教 107" },
  { name: "天文学概论", capacity: 120, credits: 2, classroom: "公教 108" },
  { name: "博弈论入门", capacity: 90, credits: 2, classroom: "公教 201" },
  {
    name: "环境保护与可持续发展",
    capacity: 120,
    credits: 2,
    classroom: "公教 202",
  },
  {
    name: "中国传统文化概论",
    capacity: 120,
    credits: 2,
    classroom: "公教 203",
  },
  { name: "演讲与口才", capacity: 60, credits: 1, classroom: "公教 204" },
  { name: "营养与健康", capacity: 90, credits: 2, classroom: "公教 205" },
  { name: "多媒体技术应用", capacity: 60, credits: 1, classroom: "公教 206" },
  { name: "中外文学名著导读", capacity: 60, credits: 1, classroom: "公教 207" },
];

// 选修课时间段（傍晚 7-8 节，避免与任何专业必修课冲突）
const ELEC_SLOTS = [
  [ts(1, 7)],
  [ts(2, 7)],
  [ts(3, 7)],
  [ts(4, 7)],
  [ts(5, 7)],
  [ts(1, 7), ts(3, 7)],
  [ts(2, 7), ts(4, 7)],
  [ts(3, 7), ts(5, 7)],
  [ts(1, 7), ts(4, 7)],
  [ts(2, 7), ts(5, 7)],
  [ts(1, 7)],
  [ts(3, 7)],
  [ts(5, 7)],
  [ts(2, 7)],
  [ts(4, 7)],
];

const ELECTIVES: Course[] = (() => {
  // 每个学生随机选 2 门选修课
  const map = new Map<number, number[]>();
  ALL_STUDENTS.forEach((s) => {
    const choices = faker.helpers
      .shuffle([...ELECTIVE_DEFS.keys()])
      .slice(0, 2);
    map.set(s.id, choices);
  });
  // 按选修课汇总选课学生
  const ids: number[][] = ELECTIVE_DEFS.map(() => []);
  map.forEach((choices, studentId) => {
    choices.forEach((ci) => {
      ids[ci]!.push(studentId);
    });
  });
  return ELECTIVE_DEFS.map((def, i) => ({
    id: cidNext(),
    name: def.name,
    category: "选修",
    credits: def.credits,
    semester: SEM,
    teacherId: TEACHERS[11 + i]!.id,
    teacherName: TEACHERS[11 + i]!.name,
    timeSlots: ELEC_SLOTS[i % ELEC_SLOTS.length]!,
    classroom: def.classroom,
    capacity: def.capacity,
    studentIds: ids[i]!,
    enrolledCount: ids[i]!.length,
  }));
})();

// ========== 全部课程 ==========
export const courses: Course[] = [
  // 公共基础课 5 门
  c_gd,
  c_xd,
  c_yy,
  c_cl,
  c_sx,
  // 专业必修课 6 门
  c_jz,
  c_by,
  c_se_intro,
  c_se_test,
  c_ai_intro,
  c_ml,
  // 公选课 15 门
  ...ELECTIVES,
];

// ============================================================
//  4. 成绩（历史学期，基于当前课程生成，用于演示成绩查询和统计）
// ============================================================
const PAST_SEM = "2025-2026-2";
// 取前 7 门课作为"上学期已结课"的课程来生成成绩
const GRADED_COURSE_IDS = [c_gd, c_xd, c_yy, c_cl, c_sx, c_jz, c_by].map(
  (c) => c.id,
);
export const grades: Grade[] = [];
for (const courseId of GRADED_COURSE_IDS) {
  for (const s of faker.helpers
    .shuffle([...ALL_STUDENTS])
    .slice(0, faker.number.int({ min: 60, max: 240 }))) {
    const score = faker.number.int({ min: 50, max: 98 });
    grades.push({
      courseId,
      studentId: s.id,
      score,
      gpa: score < 60 ? 0 : parseFloat(((score - 50) / 10).toFixed(1)),
      semester: PAST_SEM,
    });
  }
}

// ============================================================
//  5. 公告（20 条）
// ============================================================
export const announcements: Announcement[] = [
  {
    id: 1,
    title: "2026-2027 学年第一学期选课通知",
    content:
      "各位同学：2026-2027 学年第一学期选课系统将于 2026 年 8 月 25 日 9:00 开放，请同学们按时登录教务系统完成选课。补退选时间为开学第一周。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-20 10:00:00",
    updatedAt: "2026-07-20 10:00:00",
  },
  {
    id: 2,
    title: "关于期末考试成绩复查的通知",
    content:
      "2025-2026 学年第二学期期末考试成绩已公布。如需复查成绩，请于 7 月 30 日前到各学院教务办公室提交申请，逾期不予受理。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-18 14:30:00",
    updatedAt: "2026-07-18 14:30:00",
  },
  {
    id: 3,
    title: "2026 届毕业生论文答辩安排",
    content:
      "2026 届本科毕业论文答辩定于 2026 年 6 月 10 日至 6 月 20 日进行，具体分组及时间安排请查看各学院通知。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-06-01 09:00:00",
    updatedAt: "2026-06-01 09:00:00",
  },
  {
    id: 4,
    title: "教务系统升级维护公告",
    content:
      "教务管理系统将于 2026 年 8 月 1 日 0:00-6:00 进行系统升级维护，届时系统将暂停服务。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-15 16:00:00",
    updatedAt: "2026-07-15 16:00:00",
  },
  {
    id: 5,
    title: "关于规范课程考核方式的通知",
    content:
      "即日起所有必修课程期末考试占比不得低于总评成绩的 60%，平时成绩不得超过 40%。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-05-20 11:00:00",
    updatedAt: "2026-05-20 11:00:00",
  },
  {
    id: 6,
    title: "2026 年秋季学期教材征订通知",
    content:
      "各学院：2026-2027 学年第一学期教材征订工作现已启动，请各教研室于 8 月 10 日前提交教材选用申请表至教务处教材科。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-10 09:00:00",
    updatedAt: "2026-07-10 09:00:00",
  },
  {
    id: 7,
    title: "关于举办第十届程序设计竞赛的通知",
    content:
      "学校定于 2026 年 9 月 20 日举办第十届程序设计竞赛。竞赛采用 ACM 赛制，设一等奖 1 名、二等奖 3 名、三等奖 5 名。报名截止：2026 年 9 月 10 日。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-08 10:30:00",
    updatedAt: "2026-07-12 15:00:00",
  },
  {
    id: 8,
    title: "2026-2027 学年第一学期补考安排",
    content:
      "补考时间定于 2026 年 9 月 5 日至 9 月 12 日。具体科目和时间安排请登录系统查看个人考试安排。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-05 08:00:00",
    updatedAt: "2026-07-05 08:00:00",
  },
  {
    id: 9,
    title: "图书馆暑期开放时间调整通知",
    content:
      "暑假期间（7 月 25 日至 8 月 24 日），图书馆开放时间调整为周一至周五 9:00-17:00。电子资源 24 小时正常访问。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-07-01 16:00:00",
    updatedAt: "2026-07-01 16:00:00",
  },
  {
    id: 10,
    title: "关于开展 2026 年度教师教学能力培训的通知",
    content:
      "教务处将于 8 月 20 日至 8 月 22 日举办教师教学能力提升培训班。培训内容包括：课程思政建设、混合式教学设计、教学竞赛经验分享等。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-06-25 14:00:00",
    updatedAt: "2026-08-15 09:00:00",
  },
  {
    id: 11,
    title: "关于 2026 级新生入学报到的通知",
    content:
      "2026 级新生报到时间为 2026 年 9 月 1 日至 9 月 2 日。新生军训时间为 9 月 3 日至 9 月 18 日。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-06-20 10:00:00",
    updatedAt: "2026-06-20 10:00:00",
  },
  {
    id: 12,
    title: "关于推荐优秀本科生参加国际交流项目的通知",
    content:
      "现面向大二、大三本科生选拔 10 名优秀学生参加 2027 年春季学期国际交流项目。要求：GPA 不低于 3.5，英语六级 500 分以上。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-06-15 11:00:00",
    updatedAt: "2026-06-15 11:00:00",
  },
  {
    id: 13,
    title: "2025-2026 学年第二学期期末考试周安排",
    content:
      "本学期期末考试周为 2026 年 7 月 4 日至 7 月 15 日。请同学们提前 15 分钟到达考场。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-06-01 08:30:00",
    updatedAt: "2026-06-01 08:30:00",
  },
  {
    id: 14,
    title: "计算机科学与技术学院学术报告预告",
    content:
      "题目：大语言模型在软件工程中的应用\n报告人：清华大学计算机系 刘教授\n时间：2026 年 9 月 15 日 14:00-16:00",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-05-28 15:00:00",
    updatedAt: "2026-09-10 09:30:00",
  },
  {
    id: 15,
    title: "关于做好 2026 年大学生创新创业项目申报的通知",
    content:
      "2026 年大学生创新创业训练计划项目申报工作已启动，资助经费 3000-10000 元。截止：2026 年 10 月 15 日。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-05-20 09:00:00",
    updatedAt: "2026-05-20 09:00:00",
  },
  {
    id: 16,
    title: "校园网络升级通知",
    content:
      "信息化中心将于 5 月 28 日 8:00-20:00 对校园网核心设备进行升级，出口带宽将从 10G 提升至 20G。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-05-15 10:00:00",
    updatedAt: "2026-05-15 10:00:00",
  },
  {
    id: 17,
    title: "关于评选 2025-2026 学年优秀班主任的通知",
    content:
      "各学院推荐名额不超过班主任总数的 15%，请于 7 月 15 日前将推荐材料报送学生工作处。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-05-10 14:00:00",
    updatedAt: "2026-05-10 14:00:00",
  },
  {
    id: 18,
    title: "数学建模竞赛赛前培训报名",
    content:
      "2026 年全国大学生数学建模竞赛将于 9 月 16 日至 9 月 19 日举行。数统学院将于暑期开展赛前集训。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-04-28 10:30:00",
    updatedAt: "2026-06-15 16:00:00",
  },
  {
    id: 19,
    title: "关于开展校园安全大检查的通知",
    content:
      "学校定于 5 月 5 日至 5 月 10 日开展全校安全大检查。重点检查实验室、学生宿舍、食堂、消防设施等。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-04-20 08:00:00",
    updatedAt: "2026-04-20 08:00:00",
  },
  {
    id: 20,
    title: "信息与通信工程学院 5G 通信技术开放实验通知",
    content: "通信学院新建 5G 通信实验平台现已面向全校学生开放预约。",
    publisherId: 1,
    publisherName: "系统管理员",
    createdAt: "2026-04-15 09:00:00",
    updatedAt: "2026-04-15 09:00:00",
  },
];

// ============================================================
//  6. 日志（50000 条）
// ============================================================
const ACTIONS = [
  "登录",
  "查询课表",
  "选课",
  "退课",
  "录入成绩",
  "修改课程",
  "新增用户",
  "查看日志",
  "删除课程",
  "修改成绩",
];
const DETAILS = [
  "登录系统",
  "查看了本学期课表",
  "选修了课程",
  "退选了课程",
  "录入了期末考试成绩",
  "修改了课程信息",
  "新增了用户账号",
  "查看了系统操作日志",
  "删除了课程",
  "修改了学生成绩",
];

export const logs: LogEntry[] = Array.from({ length: 50000 }, (_, i) => {
  const user = faker.helpers.arrayElement(users);
  const idx = faker.number.int({ min: 0, max: ACTIONS.length - 1 });
  return {
    id: i + 1,
    userId: user.id,
    userName: user.name,
    time: faker.date
      .between({ from: "2025-09-01", to: "2026-07-24" })
      .toISOString()
      .replace("T", " ")
      .slice(0, 19),
    action: ACTIONS[idx]!,
    detail: DETAILS[idx]!,
  };
});

// ============================================================
//  7. 评教（13 条）
// ============================================================
export const counterEvaluations: Evaluation[] = [
  {
    id: 1,
    courseId: 1,
    courseName: "高等数学",
    studentId: CS1_STUDENTS[0]!.id,
    studentName: CS1_STUDENTS[0]!.name,
    teacherId: TEACHERS[0]!.id,
    semester: PAST_SEM,
    score: 5,
    comment: "讲课深入浅出，板书清晰，课堂互动很多！",
    createdAt: "2026-07-15 14:30:00",
  },
  {
    id: 2,
    courseId: 1,
    courseName: "高等数学",
    studentId: CS1_STUDENTS[1]!.id,
    studentName: CS1_STUDENTS[1]!.name,
    teacherId: TEACHERS[0]!.id,
    semester: PAST_SEM,
    score: 4,
    comment: "课程内容充实，但作业量偏大。",
    createdAt: "2026-07-16 10:00:00",
  },
  {
    id: 3,
    courseId: 1,
    courseName: "高等数学",
    studentId: CS1_STUDENTS[2]!.id,
    studentName: CS1_STUDENTS[2]!.name,
    teacherId: TEACHERS[0]!.id,
    semester: PAST_SEM,
    score: 5,
    comment: "老师很负责，课后答疑耐心。",
    createdAt: "2026-07-14 09:00:00",
  },
  {
    id: 4,
    courseId: 2,
    courseName: "线性代数",
    studentId: CS1_STUDENTS[3]!.id,
    studentName: CS1_STUDENTS[3]!.name,
    teacherId: TEACHERS[1]!.id,
    semester: PAST_SEM,
    score: 4,
    comment: "讲解清晰，例题丰富。",
    createdAt: "2026-07-15 16:00:00",
  },
  {
    id: 5,
    courseId: 2,
    courseName: "线性代数",
    studentId: SE1_STUDENTS[0]!.id,
    studentName: SE1_STUDENTS[0]!.name,
    teacherId: TEACHERS[1]!.id,
    semester: PAST_SEM,
    score: 3,
    comment: "进度稍快，有些概念没完全理解。",
    createdAt: "2026-07-17 11:00:00",
  },
  {
    id: 6,
    courseId: 3,
    courseName: "大学英语（一）",
    studentId: CS2_STUDENTS[0]!.id,
    studentName: CS2_STUDENTS[0]!.name,
    teacherId: TEACHERS[2]!.id,
    semester: PAST_SEM,
    score: 5,
    comment: "刘教授发音标准，课堂活动丰富！",
    createdAt: "2026-07-14 15:00:00",
  },
  {
    id: 7,
    courseId: 3,
    courseName: "大学英语（一）",
    studentId: AI1_STUDENTS[0]!.id,
    studentName: AI1_STUDENTS[0]!.name,
    teacherId: TEACHERS[2]!.id,
    semester: PAST_SEM,
    score: 4,
    comment: "课堂氛围好，刘教授很幽默。",
    createdAt: "2026-07-16 08:30:00",
  },
  {
    id: 8,
    courseId: 4,
    courseName: "C语言程序设计",
    studentId: CS1_STUDENTS[4]!.id,
    studentName: CS1_STUDENTS[4]!.name,
    teacherId: TEACHERS[3]!.id,
    semester: PAST_SEM,
    score: 5,
    comment: "上机实验充分，编程能力提升很快。",
    createdAt: "2026-07-15 10:00:00",
  },
  {
    id: 9,
    courseId: 5,
    courseName: "思想道德与法治",
    studentId: SE2_STUDENTS[0]!.id,
    studentName: SE2_STUDENTS[0]!.name,
    teacherId: TEACHERS[4]!.id,
    semester: PAST_SEM,
    score: 4,
    comment: "案例丰富，课堂生动。",
    createdAt: "2026-07-18 14:00:00",
  },
  {
    id: 10,
    courseId: 5,
    courseName: "思想道德与法治",
    studentId: AI2_STUDENTS[0]!.id,
    studentName: AI2_STUDENTS[0]!.name,
    teacherId: TEACHERS[4]!.id,
    semester: PAST_SEM,
    score: 4,
    comment: "课程有深度，讨论环节很有启发。",
    createdAt: "2026-07-18 16:00:00",
  },
  {
    id: 11,
    courseId: 6,
    courseName: "计算机组成原理",
    studentId: CS1_STUDENTS[5]!.id,
    studentName: CS1_STUDENTS[5]!.name,
    teacherId: TEACHERS[5]!.id,
    semester: PAST_SEM,
    score: 3,
    comment: "实验课安排可以更多些。",
    createdAt: "2026-07-17 09:00:00",
  },
  {
    id: 12,
    courseId: 7,
    courseName: "编译原理",
    studentId: AI1_STUDENTS[1]!.id,
    studentName: AI1_STUDENTS[1]!.name,
    teacherId: TEACHERS[6]!.id,
    semester: PAST_SEM,
    score: 5,
    comment: "老师讲得特别好，对编译有了新的认识。",
    createdAt: "2026-07-17 10:30:00",
  },
  {
    id: 13,
    courseId: 11,
    courseName: "机器学习",
    studentId: AI2_STUDENTS[0]!.id,
    studentName: AI2_STUDENTS[0]!.name,
    teacherId: TEACHERS[10]!.id,
    semester: PAST_SEM,
    score: 4,
    comment: "课程内容前沿，实践项目很有挑战性。",
    createdAt: "2026-07-18 09:00:00",
  },
];

// ============================================================
//  8. 计数器
// ============================================================
export const counters = {
  user: uid + 1,
  course: cid + 1,
  class: 7,
  grade: grades.length,
  log: 50001,
  announcement: 21,
};

// ============================================================
//  运行时数据持久化
// ============================================================
const SHARED_SNAPSHOT_KEY = "course-admin-snapshot";

// 种子数据深拷贝（用于登出时重置）
let seedSnapshot: string | null = null;

// 保存当前运行时数据到共享 localStorage
export function saveSnapshot() {
  try {
    localStorage.setItem(
      SHARED_SNAPSHOT_KEY,
      JSON.stringify({
        courses,
        users,
        grades,
        announcements,
        counterEvaluations,
        // 不含 logs（50000 条约 10MB，超出 localStorage 5MB 限制）
        counters,
      }),
    );
  } catch {
    // ignore
  }
}

// 从共享 localStorage 恢复数据，没有则用种子数据
export function restoreSnapshot() {
  try {
    const raw = localStorage.getItem(SHARED_SNAPSHOT_KEY);
    if (!raw) return; // 首次使用，用种子数据
    const snap = JSON.parse(raw) as {
      courses: Course[];
      users: MockUser[];
      grades: Grade[];
      announcements: Announcement[];
      counterEvaluations: Evaluation[];
      counters: typeof counters;
    };
    courses.length = 0;
    courses.push(...snap.courses);
    users.length = 0;
    users.push(...snap.users);
    grades.length = 0;
    grades.push(...snap.grades);
    announcements.length = 0;
    announcements.push(...snap.announcements);
    counterEvaluations.length = 0;
    counterEvaluations.push(...snap.counterEvaluations);
    Object.assign(counters, snap.counters);
  } catch {
    // ignore
  }
}

// 清除当前内存数据，恢复为种子数据
export function resetToSeed() {
  if (!seedSnapshot) return;
  try {
    const snap = JSON.parse(seedSnapshot) as {
      courses: Course[];
      users: MockUser[];
      grades: Grade[];
      announcements: Announcement[];
      counterEvaluations: Evaluation[];
      counters: typeof counters;
    };
    courses.length = 0;
    courses.push(...snap.courses);
    users.length = 0;
    users.push(...snap.users);
    grades.length = 0;
    grades.push(...snap.grades);
    announcements.length = 0;
    announcements.push(...snap.announcements);
    counterEvaluations.length = 0;
    counterEvaluations.push(...snap.counterEvaluations);
    Object.assign(counters, snap.counters);
  } catch {
    // ignore
  }
}

// 保存种子数据快照
try {
  seedSnapshot = JSON.stringify({
    courses,
    users,
    grades,
    announcements,
    counterEvaluations,
    counters,
  });
} catch {
  // ignore
}

// ============================================================
//  API 权限辅助
// ============================================================

// 从请求头解析当前登录用户信息（用于 Mock handler 权限检查）
export function getUserFromRequest(
  request: Request,
): { id: number; name: string; role: string } | null {
  const auth = request.headers.get("Authorization");
  if (!auth) return null;
  const match = auth.match(/mock-jwt-(\d+)-/);
  if (!match) return null;
  const userId = Number(match[1]);
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  return { id: user.id, name: user.name, role: user.role };
}

// 要求请求具有指定角色之一，否则返回 403
export function requireRole(
  request: Request,
  ...roles: string[]
): ReturnType<typeof getUserFromRequest> {
  const user = getUserFromRequest(request);
  if (!user || !roles.includes(user.role)) return null;
  return user;
}

// ============================================================
//  日志
// ============================================================

// 新增一条操作日志，并持久化到共享快照
export function pushLog(
  userId: number,
  userName: string,
  action: string,
  detail: string,
) {
  const now = new Date();
  const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  // 使用 maxId + 1 避免删除日志后 id 重复
  const maxId = logs.reduce((max, l) => Math.max(max, l.id), 0);
  logs.unshift({
    id: maxId + 1,
    userId,
    userName,
    time,
    action,
    detail,
  });
  saveSnapshot(); // 共享持久化
}
