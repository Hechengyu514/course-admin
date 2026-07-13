import { Button, Input, Modal, Space, Table, Card } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import type { FormField, User } from "@/types";
import { FormModal } from "@/components/FormModal";
import { debounce } from "@/utils/debounce";

const teacherFields: FormField[] = [
  { name: "name", label: "教师姓名", type: "input", required: true },
  {
    name: "role",
    label: "角色",
    type: "disabled",
    initialValue: "教师",
  },
];

/**
 * 教师管理（管理员端）
 *
 * 查看全部教师，支持搜索、新增、编辑、删除。使用 FormModal 通用表单。
 */

export default function TeacherManage() {
  const [keyword, setKeyword] = useState("");
  const debouncedSetKeyword = useMemo(() => debounce((v: string) => setKeyword(v), 300), []);
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const data = useMemo(
    () =>
      users
        .filter((u) => u.role === "teacher")
        .filter((u) =>
          u.name.toUpperCase().includes(keyword.toUpperCase().trim()),
        ),
    [users, keyword],
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const { addUser, updateUser, deleteUser } = useUserStore();

  const handleAdd = () => {
    setEditingTeacher(null);
    setModalOpen(true);
  };
  const handleEdit = (teacher: User) => {
    setEditingTeacher(teacher);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingTeacher) {
      updateUser({ ...editingTeacher, ...values });
    } else {
      addUser({ id: Date.now(), role: "teacher", ...values } as User);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({ title: "确认删除该教师？", onOk: () => deleteUser(id) });
  };

  const columns = [
    { title: "姓名", dataIndex: "name", key: "name" },
    { title: "工号", dataIndex: "id", key: "id" },
    { title: "角色", key: "role", render: () => "教师" },
    {
      title: "操作",
      key: "action",
      render: (_: unknown, record: User) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="输入教师姓名搜索"
          onSearch={debouncedSetKeyword}
          onChange={(e) => {
            if (!e.target.value) setKeyword("");
          }}
          style={{ width: 240 }}
        />
        <Button type="primary" onClick={handleAdd}>
          新增教师
        </Button>
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
        title={editingTeacher ? "编辑教师" : "新增教师"}
        initialValues={editingTeacher ?? undefined}
        fields={teacherFields}
      />
    </Card>
  );
}
