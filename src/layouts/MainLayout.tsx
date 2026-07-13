import { useEffect } from "react";
import { Layout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  EditOutlined,
  SearchOutlined,
  TeamOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { Role } from "@/types";
import { useUserStore } from "@/store/userStore";
import styles from "./MainLayout.module.css";

const { Sider, Header, Content } = Layout;

// 角色
const roleLabel: Record<Role, string> = {
  admin: "管理员",
  teacher: "教师",
  student: "学生",
};

// 菜单配置
interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const menuConfig: MenuItem[] = [
  {
    key: "/",
    label: "课表视图",
    icon: <CalendarOutlined />,
    roles: ["admin", "teacher", "student"],
  },
  {
    key: "/courses",
    label: "课程管理",
    icon: <BookOutlined />,
    roles: ["admin", "teacher"],
  },
  {
    key: "/enroll",
    label: "选课系统",
    icon: <ShoppingCartOutlined />,
    roles: ["student"],
  },
  {
    key: "/students",
    label: "学生管理",
    icon: <UserOutlined />,
    roles: ["admin"],
  },
  {
    key: "/teachers",
    label: "教师管理",
    icon: <TeamOutlined />,
    roles: ["admin"],
  },
  {
    key: "/logs",
    label: "系统日志",
    icon: <FileTextOutlined />,
    roles: ["admin"],
  },
  {
    key: "/grade-input",
    label: "成绩录入",
    icon: <EditOutlined />,
    roles: ["teacher"],
  },
  {
    key: "/grade-query",
    label: "成绩查询",
    icon: <SearchOutlined />,
    roles: ["student"],
  },
];

/**
 * 主布局：左侧菜单 + 顶部栏 + 内容区
 * - 菜单按角色过滤
 * - 未登录自动跳转 /login
 * - 顶部显示当前用户 + 退出按钮
 */
export default function MainLayout() {
  const currentUser = useUserStore((s) => s.currentUser);
  const logout = useUserStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser) navigate("/login", { replace: true });
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const menuItems = menuConfig
    .filter((item) => item.roles.includes(currentUser.role))
    .map(({ key, icon, label }) => ({ key, icon, label }));

  return (
    <Layout className={styles.root}>
      <Sider theme="light" width={220} className={styles.sider}>
        <div className={styles.logo}>
          <BookOutlined className={styles.logoIcon} />
          教务管理系统
        </div>
        <Menu
          mode="inline"
          theme="light"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className={styles.menu}
          selectedKeys={[location.pathname]}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <span className={styles.welcome}>
            欢迎，<span className={styles.welcomeName}>{currentUser.name}</span>
            <span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>
              （{roleLabel[currentUser.role]}）
            </span>
          </span>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            style={{ color: "#666" }}
          >
            退出登录
          </Button>
        </Header>

        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
