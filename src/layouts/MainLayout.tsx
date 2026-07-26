import { useEffect } from "react";
import { Layout, Menu, Dropdown, Badge, Select } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  CalendarOutlined,
  BookOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  EditOutlined,
  SearchOutlined,
  TeamOutlined,
  FileTextOutlined,
  NotificationOutlined,
  LogoutOutlined,
  StarOutlined,
  SettingOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { Role } from "@/types";
import { useUserStore } from "@/store/userStore";
import { useReadStatusStore } from "@/store/readStatusStore";
import { useAnnouncementStore } from "@/store/announcementStore";
import { useSemesterStore } from "@/store/semesterStore";
import { SEMESTERS } from "@/constants";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import styles from "./MainLayout.module.css";

const { Sider, Header, Content } = Layout;

const roleLabel: Record<Role, string> = {
  admin: "管理员",
  teacher: "教师",
  student: "学生",
};

// ========== 菜单配置 ==========
interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const menuConfig: MenuItem[] = [
  {
    key: "/",
    label: "仪表盘",
    icon: <DashboardOutlined />,
    roles: ["admin", "teacher", "student"],
  },
  {
    key: "/schedule",
    label: "课表视图",
    icon: <CalendarOutlined />,
    roles: ["admin", "teacher", "student"],
  },
  {
    key: "/announcements",
    label: "通知公告",
    icon: <NotificationOutlined />,
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
  {
    key: "/my-evaluation",
    label: "学生评教",
    icon: <StarOutlined />,
    roles: ["student"],
  },
  {
    key: "/evaluation-stats",
    label: "评教统计",
    icon: <BarChartOutlined />,
    roles: ["admin", "teacher"],
  },
  {
    key: "/settings",
    label: "系统设置",
    icon: <SettingOutlined />,
    roles: ["admin"],
  },
];

// 主布局：左侧菜单 + 顶部栏（含用户下拉菜单） + 内容区
export default function MainLayout() {
  const currentUser = useUserStore((s) => s.currentUser);
  const logout = useUserStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  // 公告已读状态
  const readIds = useReadStatusStore((s) => s.readIds);
  const announcements = useAnnouncementStore((s) => s.announcements);
  const fetchAnnouncements = useAnnouncementStore((s) => s.fetchAnnouncements);
  const unreadCount = announcements.filter(
    (a) => !readIds.includes(a.id),
  ).length;

  // 学期管理
  const currentSemester = useSemesterStore((s) => s.currentSemester);
  const setSemester = useSemesterStore((s) => s.setSemester);

  useEffect(() => {
    if (!currentUser) navigate("/login", { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) fetchAnnouncements();
  }, [fetchAnnouncements, currentUser]);

  if (!currentUser) return null;

  const menuItems = menuConfig
    .filter((item) => item.roles.includes(currentUser.role))
    .map(({ key, icon, label }) => ({
      key,
      icon,
      label:
        key === "/announcements" && unreadCount > 0 ? (
          <Badge count={unreadCount} size="small" offset={[8, 0]}>
            {label}
          </Badge>
        ) : (
          label
        ),
    }));

  // 根据当前路径匹配菜单高亮
  const selectedKey =
    location.pathname === "/"
      ? "/"
      : `/${location.pathname.split("/")[1] || ""}`;

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人中心",
      onClick: () => navigate("/profile"),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: () => {
        logout();
        navigate("/login", { replace: true });
      },
    },
  ];

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
          selectedKeys={[selectedKey]}
        />
      </Sider>

      <Layout>
        <Header className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {currentUser.role === "admin" && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}
                >
                  统计学期
                </span>
                <Select
                  value={currentSemester}
                  onChange={setSemester}
                  size="small"
                  style={{ width: 160 }}
                  options={SEMESTERS.map((s) => ({ value: s, label: s }))}
                />
              </span>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <span className={styles.welcome} style={{ cursor: "pointer" }}>
                欢迎，
                <span className={styles.welcomeName}>{currentUser.name}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>
                  （{roleLabel[currentUser.role]}）
                </span>
              </span>
            </Dropdown>
          </div>
        </Header>

        <Content className={styles.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
}
