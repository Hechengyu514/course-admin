import { Button, Input, Space, Table, Card, App } from "antd";
import { ImportOutlined } from "@ant-design/icons";
import { useState, useMemo, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useClassStore } from "@/store/classStore";
import type { FormField, User } from "@/types";
import { FormModal } from "@/components/FormModal";
import { ImportModal } from "@/components/ImportModal";
import { batchCreateUsersAPI } from "@/api/users";
import { debounce } from "@/utils/debounce";

// ========== 角色配置 ==========
interface RoleConfig {
  label: string;
  idLabel: string;
  searchPlaceholder: string;
  modalTitle: (editing: boolean) => string;
  confirmDelete: string;
}

const configs: Record<"student" | "teacher", RoleConfig> = {
  student: {
    label: "学生",
    idLabel: "学号",
    searchPlaceholder: "输入学生姓名或学号搜索",
    modalTitle: (editing) => (editing ? "编辑学生" : "新增学生"),
    confirmDelete: "确认删除该学生？",
  },
  teacher: {
    label: "教师",
    idLabel: "工号",
    searchPlaceholder: "输入教师姓名或工号搜索",
    modalTitle: (editing) => (editing ? "编辑教师" : "新增教师"),
    confirmDelete: "确认删除该教师？",
  },
};

const DEPARTMENTS = [
  "计算机科学与技术学院",
  "数学与统计学院",
  "信息与通信工程学院",
  "物理与电子工程学院",
  "化学与材料科学学院",
  "经济与管理学院",
  "外国语学院",
  "文学院",
];

// ========== 表单字段 ==========
function buildFields(
  role: "student" | "teacher",
  classes: { id: number; name: string }[],
): FormField[] {
  const fields: FormField[] = [
    {
      name: "userId",
      label: configs[role].idLabel,
      type: "input",
      required: true,
    },
    {
      name: "name",
      label: "姓名",
      type: "input",
      required: true,
    },
    {
      name: "gender",
      label: "性别",
      type: "select",
      required: true,
      options: [
        { value: "男", label: "男" },
        { value: "女", label: "女" },
      ],
    },
    {
      name: "department",
      label: "院系",
      type: "select",
      required: true,
      options: DEPARTMENTS.map((d) => ({ value: d, label: d })),
    },
    { name: "phone", label: "手机号", type: "input", required: true },
    { name: "email", label: "邮箱", type: "input", required: true },
  ];

  if (role === "student") {
    fields.push({
      name: "enrolledYear",
      label: "入学年份",
      type: "number",
      required: true,
      min: 2015,
      max: 2030,
    });
    if (classes.length > 0) {
      fields.push({
        name: "classId",
        label: "班级",
        type: "select",
        required: true,
        options: classes.map((c) => ({ value: c.id, label: c.name })),
      });
    }
  }

  fields.push({
    name: "role",
    label: "角色",
    type: "disabled",
    initialValue: configs[role].label,
  });

  return fields;
}

interface Props {
  role: "student" | "teacher";
}

/**
 * 通用用户管理页
 *
 * 通过 role prop 区分学生管理和教师管理。
 * 管理员可搜索、新增、编辑、删除用户。
 */
export default function UserManage({ role }: Props) {
  const { message, modal } = App.useApp();
  const cfg = configs[role];
  const classes = useClassStore((s) => s.classes);
  const fetchClasses = useClassStore((s) => s.fetchClasses);
  const fields = useMemo(() => buildFields(role, classes), [role, classes]);

  const [keyword, setKeyword] = useState("");
  const debouncedSetKeyword = useMemo(
    () => debounce((v: string) => setKeyword(v), 300),
    [],
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);
  const { addUser, updateUser, deleteUser } = useUserStore();

  useEffect(() => {
    fetchUsers();
    if (role === "student") fetchClasses();
  }, [fetchUsers, fetchClasses, role]);

  const filteredUsers = useMemo(
    () =>
      users
        .filter((u) => u.role === role)
        .filter(
          (u) =>
            u.name.toUpperCase().includes(keyword.toUpperCase().trim()) ||
            u.userId.includes(keyword.trim()),
        ),
    [users, keyword, role],
  );

  const handleAdd = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    const { classId, ...rest } = values as { classId?: number } & Record<
      string,
      unknown
    >;
    // 查找班级名称
    const cls = classId ? classes.find((c) => c.id === classId) : undefined;
    const extra = role === "student" ? { classId, className: cls?.name } : {};

    try {
      if (editingUser) {
        await updateUser({ ...editingUser, ...rest, ...extra } as User);
        message.success(`已更新${cfg.label}信息`);
      } else {
        await addUser({ id: Date.now(), role, ...rest, ...extra } as User);
        message.success(`已新增${cfg.label}`);
      }
      setModalOpen(false);
    } catch {
      message.error("保存失败，请重试");
    }
  };

  const handleDelete = (user: User) => {
    modal.confirm({
      title: cfg.confirmDelete,
      onOk: async () => {
        try {
          await deleteUser(user.id);
        } catch {
          message.error("删除失败，请重试");
          return;
        }
        // 5 秒内可撤销
        const key = `undo-${user.id}`;
        message.success({
          content: (
            <span>
              已删除{cfg.label}「{user.name}」
              <a
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  try {
                    await addUser(user);
                    message.destroy(key);
                    message.success(`已恢复${cfg.label}「${user.name}」`);
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

  const handleImport = async (data: Record<string, unknown>[]) => {
    const items = data.map((row) => {
      const className = role === "student" ? String(row["班级"] ?? "") : "";
      const cls = className
        ? classes.find((c) => c.name === className)
        : undefined;
      return {
        userId: String(row["学号"] ?? row["工号"] ?? row.userId ?? ""),
        name: String(row["姓名"] ?? row.name ?? ""),
        role: role as "student" | "teacher",
        gender: String(row["性别"] ?? row.gender ?? "男"),
        department: String(row["院系"] ?? row.department ?? ""),
        phone: String(row["手机号"] ?? row.phone ?? ""),
        email: String(row["邮箱"] ?? row.email ?? ""),
        enrolledYear:
          role === "student"
            ? Number(row["入学年份"] ?? row.enrolledYear ?? 2024)
            : undefined,
        classId: cls?.id,
        className: cls?.name,
      } as Partial<User>;
    });
    await batchCreateUsersAPI(items);
    await fetchUsers();
    message.success(`成功导入 ${items.length} 名${cfg.label}`);
  };

  const columns = [
    { title: "姓名", dataIndex: "name", key: "name", width: 100 },
    { title: cfg.idLabel, dataIndex: "userId", key: "userId", width: 120 },
    { title: "性别", dataIndex: "gender", key: "gender", width: 60 },
    {
      title: "院系",
      dataIndex: "department",
      key: "department",
      ellipsis: true,
    },
    ...(role === "student"
      ? [
          {
            title: "班级",
            dataIndex: "className",
            key: "className",
            width: 100,
          },
        ]
      : []),
    { title: "手机号", dataIndex: "phone", key: "phone", width: 130 },
    {
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record: User) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={cfg.searchPlaceholder}
          onSearch={debouncedSetKeyword}
          onChange={(e) => {
            if (!e.target.value) setKeyword("");
          }}
          style={{ width: 280 }}
        />
        <Button type="primary" onClick={handleAdd}>
          新增{cfg.label}
        </Button>
        <Button onClick={() => setImportOpen(true)}>
          <ImportOutlined /> 批量导入
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 700 }}
      />

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={cfg.modalTitle(!!editingUser)}
        initialValues={editingUser ?? undefined}
        fields={fields}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title={`批量导入${cfg.label}`}
        columns={[
          { key: cfg.idLabel === "学号" ? "学号" : "工号", title: cfg.idLabel },
          { key: "姓名", title: "姓名" },
          { key: "性别", title: "性别" },
          { key: "院系", title: "院系" },
          { key: "手机号", title: "手机号" },
          { key: "邮箱", title: "邮箱" },
          ...(role === "student"
            ? [
                { key: "入学年份", title: "入学年份" },
                { key: "班级", title: "班级" },
              ]
            : []),
        ]}
        templateHeaders={
          role === "student"
            ? [
                "学号",
                "姓名",
                "性别",
                "院系",
                "手机号",
                "邮箱",
                "入学年份",
                "班级",
              ]
            : ["工号", "姓名", "性别", "院系", "手机号", "邮箱"]
        }
        templateFilename={`${cfg.label}导入模板.csv`}
        onImport={handleImport}
      />
    </Card>
  );
}
