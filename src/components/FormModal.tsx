import { useEffect } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import type { FormField } from "@/types";

/**
 * 通用表单弹窗
 *
 * 新增 / 编辑复用同一组件，通过 fields 配置驱动表单渲染。
 * initialValues 有值 = 编辑模式（回填），无值 = 新增模式（清空）。
 *
 * @param open          弹窗是否可见
 * @param onClose       关闭弹窗
 * @param onSubmit      提交回调，接收表单键值对
 * @param title         弹窗标题
 * @param initialValues 编辑时传入初始值，新增时不传
 * @param fields        字段配置数组，决定表单渲染哪些项
 */
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialValues?: Record<string, any>;
  fields: FormField[];
}

// 根据字段类型渲染对应的输入组件
function renderInput(f: FormField) {
  switch (f.type) {
    case "input":
      return <Input />;
    case "number":
      return <InputNumber min={f.min} max={f.max} style={{ width: "100%" }} />;
    case "select":
      return <Select options={f.options} mode={f.mode} />;
    case "textarea":
      return <Input.TextArea rows={3} />;
    case "disabled":
      return <Input disabled />;
    default:
      console.warn(`FormModal: 未知字段类型 "${f.type}"`);
      return null;
  }
}

export function FormModal({
  open,
  onClose,
  onSubmit,
  title,
  initialValues,
  fields,
}: Props) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      title={title}
      open={open}
      onOk={form.submit}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {fields.map((f) => (
          <Form.Item
            key={f.name}
            name={f.name}
            label={f.label}
            initialValue={f.initialValue}
            rules={
              f.required
                ? [{ required: true, message: `请输入${f.label}` }]
                : undefined
            }
          >
            {renderInput(f)}
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}
