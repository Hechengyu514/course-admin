import { Table, Input, Select, Space, Button, Card, App } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import { useSemesterStore } from "@/store/semesterStore";
import type { Course, FormField } from "@/types";
import { FormModal } from "@/components/FormModal";
import { debounce } from "@/utils/debounce";
import { checkTeacherConflict, checkClassroomConflict, formatConflictMessages } from "@/utils/scheduleConflict";
import { CATEGORIES, SEMESTERS, TIME_PRESETS, parseTimeSlots, timeSlotsToKeys } from "@/constants";

// ========== 表单值类型（FormModal → 课程数据 的边界） ==========
interface CourseFormValues {
  name: string;
  credits: number;
  category: string;
  semester: string;
  classroom: string;
  capacity: number;
  timeSlotKeys?: string[];
  teacherId?: number;
}

/**
 * 课程管理页
 *
 * 管理员：查看全部课程，可新增 / 编辑 / 删除
 * 教师：仅查看自己的课程，只读
 * 支持按课程名搜索、按分类和学期筛选。
 */

export default function CourseManage() {
  const { message, modal } = App.useApp();
  const user = useUserStore((s) => s.currentUser);
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);

  useEffect(() => {
    fetchCourses();
    fetchUsers();
  }, [fetchCourses, fetchUsers]);

  const courseFields = useMemo<FormField[]>(() => {
    const fields: FormField[] = [
      { name: "name", label: "课程名", type: "input", required: true },
      { name: "credits", label: "学分", type: "number", required: true, min: 1, max: 5 },
      { name: "category", label: "分类", type: "select", required: true,
        options: CATEGORIES.map((c) => ({ value: c, label: c })) },
      { name: "semester", label: "学期", type: "select", required: true,
        options: SEMESTERS.map((s) => ({ value: s, label: s })) },
      { name: "classroom", label: "教室", type: "input", required: true },
      { name: "timeSlotKeys", label: "上课时间", type: "select", required: true, mode: "multiple",
        options: TIME_PRESETS },
      { name: "capacity", label: "课容量", type: "number", required: true, min: 1 },
    ];

    if (user?.role === "admin") {
      const teachers = users.filter((u) => u.role === "teacher");
      fields.push({
        name: "teacherId",
        label: "授课教师",
        type: "select",
        required: true,
        options: teachers.map((t) => ({ value: t.id, label: `${t.name}（${t.userId}）` })),
      });
    }

    return fields;
  }, [user, users]);

  const [keyword, setKeyword] = useState("");
  const debouncedSetKeyword = useMemo(() => debounce((v: string) => setKeyword(v), 300), []);
  const [category, setCategory] = useState<string | undefined>(undefined);

  // 学期筛选：默认值跟随全局"统计学期"
  const globalSemester = useSemesterStore((s) => s.currentSemester);
  const [semester, setSemester] = useState<string | undefined>(globalSemester);

  const data = useMemo(
    () =>
      courses
        .filter((c) =>
          c.name.toUpperCase().includes(keyword.toUpperCase().trim()),
        )
        .filter((c) => !category || c.category === category)
        .filter((c) => !semester || c.semester === semester)
        .filter((c) => !user || user.role === "admin" || c.teacherId === user.id),
    [courses, keyword, category, semester, user],
  );

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { addCourse, updateCourse, deleteCourse, restoreCourse } = useCourseStore();

  // 等待 store hydration，避免 user 为 null 时崩溃
  if (!user) return null;

  const handleAdd = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    // 表单 → 课程数据 的类型转换边界
    const { timeSlotKeys, teacherId, ...courseFields } = values as unknown as CourseFormValues;

    const timeSlots = parseTimeSlots(timeSlotKeys);
    const tid = teacherId ?? user.id;
    const tname =
      user.role === "admin"
        ? users.find((u) => u.id === tid)?.name ?? user.name
        : user.name;
    const classroom = courseFields.classroom;

    // 冲突检测
    const teacherConflicts = checkTeacherConflict(
      timeSlots,
      tid,
      courses.filter((c) => c.semester === courseFields.semester),
      editingCourse?.id,
    );
    const classroomConflicts = checkClassroomConflict(
      timeSlots,
      classroom,
      courses.filter((c) => c.semester === courseFields.semester),
      editingCourse?.id,
    );

    const conflictMsgs = formatConflictMessages(teacherConflicts, classroomConflicts);

    const doSave = async () => {
      try {
        if (editingCourse) {
          await updateCourse({
            ...editingCourse,
            ...courseFields,
            teacherId: tid,
            teacherName: tname,
            timeSlots,
          });
          message.success("课程已更新");
        } else {
          await addCourse({
            ...courseFields,
            id: Date.now(),
            teacherId: tid,
            teacherName: tname,
            studentIds: [],
            enrolledCount: 0,
            timeSlots,
          });
          message.success("课程已创建");
        }
        setModalOpen(false);
      } catch {
        message.error("保存失败，请重试");
      }
    };

    if (conflictMsgs.length > 0) {
      modal.confirm({
        title: "检测到排课冲突",
        content: (
          <div>
            {conflictMsgs.map((msg, i) => (
              <p key={i} style={{ color: "#e74c3c" }}>{msg}</p>
            ))}
            <p style={{ marginTop: 8 }}>是否仍要保存？（建议调整时间或教室后再保存）</p>
          </div>
        ),
        okText: "强制保存",
        okType: "danger",
        cancelText: "返回修改",
        onOk: doSave,
      });
      return;
    }

    doSave();
  };

  const handleDelete = (course: Course) => {
    modal.confirm({
      title: "确认删除该课程？",
      onOk: async () => {
        try {
          await deleteCourse(course.id);
        } catch {
          message.error("删除失败，请重试");
          return;
        }
        const key = `undo-course-${course.id}`;
        message.success({
          content: (
            <span>
              已删除课程「{course.name}」
              <a
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  message.destroy(key);
                  try {
                    await restoreCourse(course);
                    message.success(`已恢复课程「${course.name}」`);
                  } catch {
                    message.error("恢复失败，请重试");
                  }
                }}
              >
                撤销
              </a>
            </span>
          ),
          key,
          duration: 5,
        });
      },
    });
  };

  const columns = [
    { title: "课程名", dataIndex: "name", key: "name" },
    { title: "授课教师", dataIndex: "teacherName", key: "teacherName" },
    { title: "学分", dataIndex: "credits", key: "credits" },
    { title: "分类", dataIndex: "category", key: "category" },
    { title: "学期", dataIndex: "semester", key: "semester" },
    { title: "教室", dataIndex: "classroom", key: "classroom" },
    {
      title: "已选",
      key: "enrolled",
      render: (_: unknown, r: Course) => `${r.enrolledCount}/${r.capacity}`,
    },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: Course) => (
        <Space>
          <a onClick={() => navigate(`/courses/${record.id}`)}>查看</a>
          {user.role === "admin" && (
            <>
              <a onClick={() => handleEdit(record)}>编辑</a>
              <a onClick={() => handleDelete(record)}>删除</a>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="输入课程名搜索"
          onSearch={debouncedSetKeyword}
          onChange={(e) => {
            if (!e.target.value) setKeyword("");
          }}
          style={{ width: 200 }}
        />
        <Select
          placeholder="筛选分类"
          allowClear
          onChange={(v) => setCategory(v)}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          style={{ width: 120 }}
        />
        <Select
          placeholder="筛选学期"
          allowClear
          onChange={(v) => setSemester(v)}
          options={SEMESTERS.map((s) => ({ value: s, label: s }))}
          style={{ width: 160 }}
        />
        {user.role === "admin" && (
          <Button type="primary" onClick={handleAdd}>
            新增课程
          </Button>
        )}
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingCourse ? "编辑课程" : "新增课程"}
        initialValues={
          editingCourse
            ? { ...editingCourse, timeSlotKeys: timeSlotsToKeys(editingCourse.timeSlots) }
            : undefined
        }
        fields={courseFields}
      />
    </Card>
  );
}
