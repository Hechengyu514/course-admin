# 教务管理系统

高校教务管理系统，支持管理员、教师、学生三种角色，包含课程管理、选课系统、成绩录入、课表视图、系统日志等功能。

**前端**：React 18 + TypeScript + Vite + Ant Design 6 + Zustand + React Router v6 + Axios

**后端**：Java 17 + Spring Boot 3 + Spring Security + JPA + H2 + JWT

## 功能概览

### 三种角色

| 角色 | 权限 |
|---|---|
| 管理员 | 全部权限：管理课程/学生/教师，查看日志 |
| 教师 | 管理自己的课程、录入成绩、查看课表 |
| 学生 | 选课/退课、查看课表、查询成绩 |

### 页面（10 个）

| 页面 | 访问角色 | 说明 |
|---|---|---|
| 登录 | 全部 | 学号/工号 + 密码登录，JWT 认证 |
| 课表视图 | 全部 | 周一~周五 × 1-8节 时间轴 Grid |
| 课程管理 | admin/teacher | 表格 + 搜索筛选 + CRUD |
| 课程详情 | 全部 | 课程信息 + 学生名单 |
| 选课系统 | student | 卡片浏览 + 时间冲突检测 + 学分上限 |
| 学生管理 | admin | 表格 + CRUD |
| 教师管理 | admin | 表格 + CRUD |
| 成绩录入 | teacher | 选课 → 录成绩 → 自动算 GPA |
| 成绩查询 | student | 按学期查成绩 + 平均 GPA |
| 系统日志 | admin | 虚拟列表 50000 条日志 |

## 技术亮点

- **通用表单组件** `FormModal` — 配置驱动，新增/编辑复用，代码量减少 40%
- **手写虚拟列表** `VirtualList` — 只渲染可见行，50000 条数据 DOM 仅 ~15 行
- **三层权限控制** — 路由守卫 + 菜单过滤 + 按钮条件渲染，集中式 `RouteGuard`
- **路由懒加载** — `React.lazy` + `Suspense` 拆 9 个 chunk
- **选课业务逻辑** — 时间冲突检测 + 学分上限校验 + GPA 5.0 制自动换算
- **JWT 认证** — Spring Security + jjwt，Axios 拦截器自动带 token
- **搜索防抖** — 300ms debounce 减少不必要的渲染
- **状态持久化** — Zustand persist，刷新不丢

## 项目结构

```
course-admin/
├── src/
│   ├── api/              # Axios 封装 + 接口层
│   ├── components/       # FormModal、VirtualList
│   ├── constants/        # 学期、分类等常量
│   ├── layouts/          # MainLayout
│   ├── pages/
│   │   ├── auth/         # 登录
│   │   ├── course/       # 课程管理、选课、详情
│   │   ├── dashboard/    # 课表视图
│   │   ├── error/        # 403 / 404
│   │   ├── grade/        # 成绩录入、查询
│   │   ├── log/          # 系统日志
│   │   └── user/         # 学生/教师管理
│   ├── router/           # 路由 + RouteGuard
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型
│   └── utils/            # 工具函数
└── course-admin-server/  # 后端 Spring Boot 项目
```

## 快速开始

### 前端

```bash
cd course-admin
pnpm install
pnpm dev          # http://localhost:5173
```

### 后端

用 IntelliJ IDEA 打开 `course-admin-server`，运行 `CourseAdminServerApplication`。

### 测试账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 管理员 | 1 | admin123 |
| 李老师 | 2 | 123456 |
| 王老师 | 3 | 123456 |
| 赵同学 | 4 | 123456 |

> 账号 1~8，服务启动时自动初始化数据。

## License

MIT
