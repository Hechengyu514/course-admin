import { Card, Form, InputNumber, DatePicker, Switch, Button, App } from "antd";
import { useSettingsStore } from "@/store/settingsStore";
import { useUserStore } from "@/store/userStore";
import { addLogAPI } from "@/api/log";
import dayjs from "dayjs";

/**
 * 系统设置（管理员端）
 *
 * 配置学分上限、选课时间、公告开关等全局参数。
 */
export default function Settings() {
  const { message } = App.useApp();
  const settings = useSettingsStore();
  const currentUser = useUserStore((s) => s.currentUser);
  const [form] = Form.useForm();

  const handleSave = (values: {
    maxCredits: number;
    enrollmentRange: [dayjs.Dayjs, dayjs.Dayjs];
    announcementsEnabled: boolean;
  }) => {
    const enrollmentStart = values.enrollmentRange[0].format("YYYY-MM-DD");
    const enrollmentEnd = values.enrollmentRange[1].format("YYYY-MM-DD");
    settings.updateSettings({
      maxCredits: values.maxCredits,
      enrollmentStart,
      enrollmentEnd,
      announcementsEnabled: values.announcementsEnabled,
    });
    addLogAPI({
      userId: currentUser?.id ?? 1,
      userName: currentUser?.name ?? "系统管理员",
      action: "修改设置",
      detail: `学分上限→${values.maxCredits} 选课时间→${enrollmentStart}~${enrollmentEnd} 公告开关→${values.announcementsEnabled ? "开" : "关"}`,
    });
    message.success("设置已保存");
  };

  return (
    <Card title="系统设置">
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 480 }}
        onFinish={handleSave}
        initialValues={{
          maxCredits: settings.maxCredits,
          enrollmentRange: [
            dayjs(settings.enrollmentStart),
            dayjs(settings.enrollmentEnd),
          ],
          announcementsEnabled: settings.announcementsEnabled,
        }}
      >
        <Form.Item
          name="maxCredits"
          label="学分上限"
          rules={[{ required: true, message: "请输入学分上限" }]}
        >
          <InputNumber min={1} max={40} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="enrollmentRange"
          label="选课时间范围"
          rules={[{ required: true, message: "请选择选课时间" }]}
        >
          <DatePicker.RangePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="announcementsEnabled" label="通知公告功能" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
