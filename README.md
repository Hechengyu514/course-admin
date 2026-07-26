# 教务管理系统

高校教务管理系统，纯前端演示项目。支持**管理员、教师、学生**三种角色，包含课程管理、选课系统、成绩录入、课表视图、评教、系统日志等功能。

**技术栈**：React 19 + TypeScript + Vite + Ant Design 6 + Zustand + React Router v7 + Recharts + MSW

> 无需后端——所有 API 由 Mock Service Worker 在浏览器端拦截返回。

## 演示账号

| 角色   | 账号       | 密码       |
| ------ | ---------- | ---------- |
| 管理员 | `admin001` | `admin123` |
| 教师   | `T1001`    | `123456`   |
| 教师   | `T2001`    | `123456`   |
| 学生   | `20241000` | `123456`   |
| 学生   | `20241040` | `123456`   |

## 功能

### 管理员

- **仪表盘** — 学生/教师总数、开课数、选课人次统计卡片 + 课程分类饼图 + 院系人数柱状图 + 成绩分布
- **课程管理** — 搜索/筛选、CRUD、排课冲突检测、撤销删除
- **学生/教师管理** — CRUD + Excel 批量导入
- **课表视图** — 按教师或教室查看课表
- **评教统计** — 查看任意教师的评教结果
- **通知公告** — 发布/编辑/删除公告
- **系统日志** — 虚拟列表渲染 50000 条日志
- **系统设置** — 学分上限、选课时段

### 教师

- **仪表盘** — 本学期授课、学生数、评教均分
- **课程管理** — 查看自己的课程（只读）
- **成绩录入** — 选择课程 → 录入百分制 → 自动换算 GPA + 成绩分布图
- **课表视图** — 查看自己的授课安排
- **评教统计** — 查看自己的评教结果

### 学生

- **仪表盘** — 已选课程、学分进度、累计 GPA、今日课程
- **选课系统** — 卡片浏览 + 时间冲突/学分上限/课程已满 三重校验 + 选课时段窗口控制
- **成绩查询** — 按学期筛选 + 学期平均 GPA + Excel 导出
- **课表视图** — 查看自己的上课安排
- **学生评教** — 对已选课程打分 + 文字评价

## 技术亮点

- **Mock Service Worker** — 浏览器端拦截 API，277 用户、29 门课程、50000 条日志全 Mock
- **API 权限校验** — `requireRole` 在 handler 层校验角色，非前端路由守卫的单层防护
- **乐观更新 + 回滚** — 选课/退课先改 UI 再调 API，失败自动回滚
- **通用 FormModal** — 配置驱动渲染，全项目新增/编辑弹窗共用一个组件
- **手写虚拟列表** — 只渲染可见行，`translateY` 定位，50000 条数据仅 ~15 个 DOM 节点
- **路由懒加载** — `React.lazy` + `Suspense` + `ErrorBoundary`，15 个页面按需加载
- **排课冲突检测** — 教师时间冲突 + 教室占用冲突，同一天 + 时间段重叠 + 教学周交集 三维判断
- **竞态防护** — `useRef` 标记最新请求，快速切换课程时防止旧数据覆盖
- **共享数据快照** — localStorage 持久化，多用户切换 + 刷新不丢修改
- **搜索防抖** — 300ms debounce 减少不必要的渲染

## 项目结构

```
src/
├── api/               # Axios 封装 + 接口层（8 个模块）
├── components/        # ErrorBoundary / FormModal / ImportModal / VirtualList
├── constants/         # 学期、分类、上课时间预设
├── layouts/           # MainLayout — 菜单 + 顶部栏 + 内容区
├── mocks/             # MSW 种子数据 + 8 组 handler
│   └── handlers/      # auth / courses / users / grades / announcements / evaluations / logs / classes
├── pages/
│   ├── admin/         # 系统设置
│   ├── announcement/  # 通知公告
│   ├── auth/          # 登录 + 忘记密码
│   ├── course/        # 课程管理 / 课程详情 / 选课系统
│   ├── dashboard/     # 仪表盘 / 课表视图
│   ├── error/         # 403 / 404
│   ├── evaluation/    # 学生评教 / 评教统计
│   ├── grade/         # 成绩录入 / 成绩查询
│   ├── log/           # 系统日志
│   ├── profile/       # 个人中心
│   └── user/          # 学生/教师管理
├── router/            # 路由表 + RouteGuard
├── store/             # Zustand 状态管理（10 个 store）
├── types/             # TypeScript 类型定义
└── utils/             # 冲突检测 / 防抖 / Excel 导出 / GPA 换算
```

## 快速开始

```bash
npm install
npm run dev          # http://localhost:5173
```

构建：

```bash
npm run build        # 输出到 dist/
npm run preview      # 本地预览构建产物
```

## License

MIT
