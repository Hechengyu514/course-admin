import { Table, Input, Select, Space, Button, Modal, Card } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseStore } from "@/store/courseStore";
import { useUserStore } from "@/store/userStore";
import type { Course, FormField } from "@/types";
import { FormModal } from "@/components/FormModal";
import { debounce } from "@/utils/debounce";
import { CATEGORIES, SEMESTERS, TIME_PRESETS, parseTimeSlots, timeSlotsToKeys } from "@/constants";

const courseFields: FormField[] = [
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

/**
 * 课程管理页
 *
 * 管理员：查看全部课程，可新增 / 编辑 / 删除
 * 教师：仅查看自己的课程，只读
 * 支持按课程名搜索、按分类和学期筛选。
 */

export default function CourseManage() {
  const user = useUserStore((s) => s.currentUser);
  const courses = useCourseStore((s) => s.courses);
  const fetchCourses = useCourseStore((s) => s.fetchCourses);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const [keyword, setKeyword] = useState("");
  const debouncedSetKeyword = useMemo(() => debounce(setKeyword, 300), []);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [semester, setSemester] = useState<string | undefined>(undefined);

  const data = useMemo(
    () =>
      courses
        .filter((c) =>
          c.name.toUpperCase().includes(keyword.toUpperCase().trim()),
        )
        .filter((c) => !category || c.category === category)
        .filter((c) => !semester || c.semester === semester)
        .filter((c) => user!.role === "admin" || c.teacherId === user!.id),
    [courses, keyword, category, semester, user],
  );

  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { addCourse, updateCourse, deleteCourse } = useCourseStore();

  const handleAdd = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const { timeSlotKeys, ...rest } = values as { timeSlotKeys?: string[] } & Record<string, unknown>;
    const timeSlots = parseTimeSlots(timeSlotKeys);

    if (editingCourse) {
      updateCourse({ ...editingCourse, ...rest, timeSlots } as Course);
    } else {
      addCourse({
        ...rest,
        id: Date.now(),
        teacherId: user!.id,
        teacherName: user!.name,
        studentIds: [],
        enrolledCount: 0,
        timeSlots,
      } as unknown as Course);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "确认删除该课程？",
      onOk: () => deleteCourse(id),
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
          {user!.role === "admin" && (
            <>
              <a onClick={() => handleEdit(record)}>编辑</a>
              <a onClick={() => handleDelete(record.id)}>删除</a>
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
        {user!.role === "admin" && (
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
