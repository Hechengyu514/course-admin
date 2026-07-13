import { Button, Input, Modal, Space, Table, Card } from "antd";
import { useState, useMemo, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import type { FormField, User } from "@/types";
import { FormModal } from "@/components/FormModal";
import { debounce } from "@/utils/debounce";

const studentFields: FormField[] = [
  { name: "name", label: "学生姓名", type: "input", required: true },
  { name: "role", label: "角色", type: "disabled", initialValue: "学生" },
];

/**
 * 学生管理（管理员端）
 *
 * 查看全部学生，支持搜索、新增、编辑、删除。使用 FormModal 通用表单。
 */

export default function StudentManage() {
  const [keyword, setKeyword] = useState("");
  const debouncedSetKeyword = useMemo(() => debounce((v: string) => setKeyword(v), 300), []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const { addUser, updateUser, deleteUser } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(
    () =>
      users
        .filter((u) => u.role === "student")
        .filter((u) =>
          u.name.toUpperCase().includes(keyword.toUpperCase().trim()),
        ),
    [users, keyword],
  );

  const handleAdd = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleEdit = (student: User) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    if (editingStudent) {
      updateUser({ ...editingStudent, ...values });
    } else {
      addUser({ id: Date.now(), role: "student", ...values } as User);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "确认删除该学生？",
      onOk: () => deleteUser(id),
    });
  };

  const columns = [
    { title: "姓名", dataIndex: "name", key: "name" },
    { title: "学号", dataIndex: "id", key: "id" },
    { title: "角色", key: "role", render: () => "学生" },
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
          placeholder="输入学生姓名搜索"
          onSearch={debouncedSetKeyword}
          onChange={(e) => {
            if (!e.target.value) setKeyword("");
          }}
          style={{ width: 240 }}
        />
        <Button type="primary" onClick={handleAdd}>
          新增学生
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={editingStudent ? "编辑学生" : "新增学生"}
        initialValues={editingStudent ?? undefined}
        fields={studentFields}
      />
    </Card>
  );
}
