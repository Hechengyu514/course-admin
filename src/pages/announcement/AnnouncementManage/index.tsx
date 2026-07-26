import { useEffect, useState, useMemo } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Badge, Typography,
} from "antd";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import { useAnnouncementStore } from "@/store/announcementStore";
import { useUserStore } from "@/store/userStore";
import { useReadStatusStore } from "@/store/readStatusStore";
import type { Announcement } from "@/types";

const { Text } = Typography;

/**
 * 通知公告管理（管理员端）
 *
 * 查看全部公告，支持新增、编辑、删除。
 * 教师和学生只能查看，不能操作。
 */
export default function AnnouncementManage() {
  const currentUser = useUserStore((s) => s.currentUser);
  const announcements = useAnnouncementStore((s) => s.announcements);
  const fetchAnnouncements = useAnnouncementStore((s) => s.fetchAnnouncements);
  const addAnnouncement = useAnnouncementStore((s) => s.addAnnouncement);
  const updateAnnouncement = useAnnouncementStore((s) => s.updateAnnouncement);
  const deleteAnnouncement = useAnnouncementStore((s) => s.deleteAnnouncement);
  const { readIds, markAsRead, markAllAsRead } = useReadStatusStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const unreadCount = useMemo(
    () => announcements.filter((a) => !readIds.includes(a.id)).length,
    [announcements, readIds],
  );

  const isAdmin = currentUser?.role === "admin";

  const handleSubmit = async (values: { title: string; content: string }) => {
    if (!currentUser) return;
    if (editing) {
      await updateAnnouncement(editing.id, values);
    } else {
      await addAnnouncement({ ...values, publisherId: currentUser.id });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleEdit = (item: Announcement) => {
    setEditing(item);
    form.setFieldsValue(item);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: any[] = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (v: string, record: Announcement) => (
        <span>
          {!readIds.includes(record.id) && (
            <Badge dot color="blue" style={{ marginRight: 4 }} />
          )}
          <Text strong={!readIds.includes(record.id)}>{v}</Text>
        </span>
      ),
    },
    {
      title: "发布人",
      dataIndex: "publisherName",
      key: "publisherName",
      width: 100,
    },
    {
      title: "发布时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: "#999" }}>{v}</span>
      ),
    },
    {
      title: "最近更新",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 180,
      render: (v: string, record: Announcement) =>
        v !== record.createdAt ? (
          <span style={{ fontSize: 12, color: "#999" }}>{v}</span>
        ) : (
          <Tag style={{ fontSize: 11 }}>未修改</Tag>
        ),
    },
  ];

  if (isAdmin) {
    columns.push({
      title: "操作",
      key: "action",
      width: 120,
      render: (_: unknown, record: Announcement) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm
            title="确认删除此公告？"
            onConfirm={() => deleteAnnouncement(record.id)}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    });
  }

  return (
    <Card
      title={
        <span>
          通知公告
          {unreadCount > 0 && (
            <Badge count={unreadCount} style={{ marginLeft: 8 }} />
          )}
        </span>
      }
      extra={
        <Space>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => markAllAsRead(announcements.map((a) => a.id))}
            >
              <CheckOutlined /> 全部已读
            </Button>
          )}
          {isAdmin && (
            <Button type="primary" onClick={handleAdd}>
              <PlusOutlined /> 发布公告
            </Button>
          )}
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={announcements}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record: Announcement) => (
            <p style={{ margin: 0, padding: "8px 0", whiteSpace: "pre-wrap" }}>
              {record.content}
            </p>
          ),
          rowExpandable: () => true,
          onExpand: (expanded, record) => {
            if (expanded) markAsRead(record.id);
          },
        }}
      />

      <Modal
        title={editing ? "编辑公告" : "发布公告"}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditing(null); }}
        onOk={form.submit}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: "请输入公告标题" }]}
          >
            <Input placeholder="公告标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: "请输入公告内容" }]}
          >
            <Input.TextArea rows={6} placeholder="公告内容" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
