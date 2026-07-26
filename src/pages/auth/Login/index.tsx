import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, App, Typography, Collapse, Tag, Space, Steps } from "antd";
import { UserOutlined, LockOutlined, CaretDownOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { useUserStore } from "@/store/userStore";
import { sendResetCodeAPI, resetPasswordAPI } from "@/api/auth";

const { Title, Text } = Typography;

// ========== 演示账号 ==========
const DEMO_ACCOUNTS = [
  { role: "管理员", account: "admin001", password: "admin123", tag: "blue" },
  { role: "教师", account: "T1001", password: "123456", tag: "green" },
  { role: "教师", account: "T2001", password: "123456", tag: "green" },
  { role: "教师", account: "T3001", password: "123456", tag: "green" },
  { role: "学生", account: "20241000", password: "123456", tag: "orange" },
  { role: "学生", account: "20241040", password: "123456", tag: "orange" },
  { role: "学生", account: "20241080", password: "123456", tag: "orange" },
] as const;

type FlowStep = "login" | "forgot" | "reset";

export default function Login() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const currentUser = useUserStore((s) => s.currentUser);
  const login = useUserStore((s) => s.login);
  const clearAuthError = useUserStore((s) => s.clearAuthError);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 忘记密码
  const [flow, setFlow] = useState<FlowStep>("login");
  const [resetAccount, setResetAccount] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetForm] = Form.useForm();

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  const handleSubmit = async (values: {
    account: string;
    password: string;
  }) => {
    setLoading(true);
    clearAuthError();
    const result = await login(values.account, values.password);
    setLoading(false);
    if (result.success) {
      message.success("登录成功");
      navigate("/", { replace: true });
    } else {
      message.error(result.error);
    }
  };

  const quickFill = (account: string, password: string) => {
    form.setFieldsValue({ account, password });
  };

  // 忘记密码 - 发送验证码
  const handleSendCode = async (values: { account: string }) => {
    setResetLoading(true);
    try {
      await sendResetCodeAPI(values.account);
      setResetAccount(values.account);
      setFlow("reset");
      message.success("验证码已发送（测试验证码：123456）");
    } catch {
      message.error("账号不存在");
    } finally {
      setResetLoading(false);
    }
  };

  // 忘记密码 - 重置密码
  const handleResetPassword = async (values: {
    code: string;
    newPassword: string;
  }) => {
    setResetLoading(true);
    try {
      await resetPasswordAPI(resetAccount, values.code, values.newPassword);
      message.success("密码重置成功，请重新登录");
      setFlow("login");
      resetForm.resetFields();
      form.resetFields();
      form.setFieldsValue({ account: resetAccount });
    } catch {
      message.error("验证码错误");
    } finally {
      setResetLoading(false);
    }
  };

  const loginCard = (
      <Card style={{ width: 420 }} styles={{ body: { padding: "40px 32px" } }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            教务管理系统
          </Title>
          <Text type="secondary">请使用学号或工号登录</Text>
        </div>

        <Form form={form} onFinish={handleSubmit} size="large">
          <Form.Item
            name="account"
            rules={[{ required: true, message: "请输入账号" }]}
          >
            <Input placeholder="学号 / 工号" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="密码" prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登 录
            </Button>
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <a onClick={() => { setFlow("forgot"); resetForm.resetFields(); }}>
              忘记密码？
            </a>
          </div>
        </Form>

        <Collapse
          ghost
          expandIconPlacement="end"
          expandIcon={({ isActive }) => (
            <CaretDownOutlined rotate={isActive ? 180 : 0} />
          )}
          items={[
            {
              key: "demo",
              label: (
                <Text type="secondary" style={{ fontSize: 13, userSelect: "none" }}>
                  演示账号 ▼
                </Text>
              ),
              children: (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {DEMO_ACCOUNTS.map((demo) => (
                    <div
                      key={demo.account}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: 4,
                        background: "#fafafa",
                        border: "1px solid #f0f0f0",
                      }}
                      onClick={() => quickFill(demo.account, demo.password)}
                    >
                      <span>
                        <Tag
                          color={demo.tag}
                          style={{ marginRight: 8, minWidth: 40, textAlign: "center" }}
                        >
                          {demo.role}
                        </Tag>
                        <Text style={{ fontSize: 13 }}>{demo.account}</Text>
                      </span>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {demo.password}
                      </Text>
                    </div>
                  ))}
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, textAlign: "center", marginTop: 4 }}
                  >
                    点击账号行可快速填充
                  </Text>
                </div>
              ),
            },
          ]}
        />
      </Card>
    );

    const forgotCard = (
      <Card style={{ width: 420 }} styles={{ body: { padding: "40px 32px" } }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>忘记密码</Title>
          <Text type="secondary">输入账号获取验证码</Text>
        </div>
        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
          <Steps current={0} size="small" items={[{ title: "验证身份" }, { title: "重置密码" }]} />
        </Space>
        <Form form={resetForm} onFinish={handleSendCode} size="large">
          <Form.Item name="account" rules={[{ required: true, message: "请输入账号或邮箱" }]}>
            <Input placeholder="学号 / 工号 / 邮箱" prefix={<MailOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={resetLoading} block>
              发送验证码
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <a onClick={() => { setFlow("login"); resetForm.resetFields(); }}>返回登录</a>
          </div>
        </Form>
      </Card>
    );

    const resetCard = (
      <Card style={{ width: 420 }} styles={{ body: { padding: "40px 32px" } }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>重置密码</Title>
          <Text type="secondary">验证码已发送至账号关联邮箱（测试码：123456）</Text>
        </div>
        <Space direction="vertical" size="middle" style={{ width: "100%", marginBottom: 16 }}>
          <Steps current={1} size="small" items={[{ title: "验证身份" }, { title: "重置密码" }]} />
        </Space>
        <Form form={resetForm} onFinish={handleResetPassword} size="large">
          <Form.Item name="code" rules={[{ required: true, message: "请输入验证码" }]}>
            <Input placeholder="验证码" prefix={<SafetyOutlined />} />
          </Form.Item>
          <Form.Item name="newPassword" rules={[
            { required: true, message: "请输入新密码" },
            { min: 6, message: "密码至少 6 位" },
          ]}>
            <Input.Password placeholder="新密码" prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={resetLoading} block>
              重置密码
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            <a onClick={() => { setFlow("forgot"); resetForm.resetFields(); }}>重新输入账号</a>
          </div>
        </Form>
      </Card>
    );

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f7fa",
        }}
      >
        {flow === "login" && loginCard}
        {flow === "forgot" && forgotCard}
        {flow === "reset" && resetCard}
      </div>
    );
}
