import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, App, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useUserStore } from "@/store/userStore";

const { Title, Text } = Typography;

export default function Login() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const currentUser = useUserStore((s) => s.currentUser);
  const login = useUserStore((s) => s.login);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  const handleSubmit = async (values: {
    account: string;
    password: string;
  }) => {
    setLoading(true);
    const ok = await login(values.account, values.password);
    setLoading(false);
    if (ok) {
      message.success("登录成功");
      navigate("/", { replace: true });
    } else {
      message.error("账号或密码错误");
    }
  };

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
      <Card style={{ width: 400 }} styles={{ body: { padding: "40px 32px" } }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            教务管理系统
          </Title>
          <Text type="secondary">请使用学号或工号登录</Text>
        </div>

        <Form onFinish={handleSubmit} size="large">
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
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            测试：学号/工号 1~8，学生/教师密码 123456，管理员密码 admin123
          </Text>
        </div>
      </Card>
    </div>
  );
}
