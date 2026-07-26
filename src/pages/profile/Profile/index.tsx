import { useState } from "react";
import {
  Card, Descriptions, Button, Modal, Form, Input, App, Divider,
} from "antd";
import { useUserStore } from "@/store/userStore";
import type { User } from "@/types";

/**
 * 个人中心
 *
 * 查看和编辑个人信息，修改密码。
 */
export default function Profile() {
  const { message } = App.useApp();
  const currentUser = useUserStore((s) => s.currentUser);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const changePassword = useUserStore((s) => s.changePassword);

  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  if (!currentUser) return null;

  const handleEdit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      await updateProfile({ ...currentUser, ...values } as User);
      setEditOpen(false);
      message.success("信息已更新");
    } catch {
      message.error("更新失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePwd = async (values: { oldPassword: string; newPassword: string }) => {
    const result = await changePassword(values.oldPassword, values.newPassword);
    if (result.success) {
      message.success("密码修改成功");
      setPwdOpen(false);
      pwdForm.resetFields();
    } else {
      message.error(result.error);
    }
  };

  const openEdit = () => {
    editForm.setFieldsValue(currentUser);
    setEditOpen(true);
  };

  return (
    <div>
      <Card title="个人信息" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="姓名">{currentUser.name}</Descriptions.Item>
          <Descriptions.Item label={currentUser.role === "student" ? "学号" : "工号"}>
            {currentUser.userId}
          </Descriptions.Item>
          <Descriptions.Item label="角色">
            {currentUser.role === "admin" ? "管理员" : currentUser.role === "teacher" ? "教师" : "学生"}
          </Descriptions.Item>
          <Descriptions.Item label="性别">{currentUser.gender}</Descriptions.Item>
          <Descriptions.Item label="院系">{currentUser.department}</Descriptions.Item>
          <Descriptions.Item label="手机号">{currentUser.phone}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
          {currentUser.role === "student" && currentUser.enrolledYear && (
            <Descriptions.Item label="入学年份">{currentUser.enrolledYear}</Descriptions.Item>
          )}
        </Descriptions>

        <Divider />
        <Button type="primary" onClick={openEdit}>
          编辑信息
        </Button>
        <Button style={{ marginLeft: 12 }} onClick={() => setPwdOpen(true)}>
          修改密码
        </Button>
      </Card>

      {/* 编辑信息弹窗 */}
      <Modal
        title="编辑个人信息"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={editForm.submit}
        confirmLoading={loading}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" onFinish={handleEdit}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={pwdOpen}
        onCancel={() => { setPwdOpen(false); pwdForm.resetFields(); }}
        onOk={pwdForm.submit}
        destroyOnHidden
      >
        <Form form={pwdForm} layout="vertical" onFinish={handleChangePwd}>
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: "请输入原密码" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码至少 6 位" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认新密码"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value: string) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
