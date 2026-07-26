import { Modal, Upload, Table, Button, Space, Typography, App } from "antd";
import { useState, useRef, useEffect } from "react";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import type { UploadFile } from "antd";

const { Dragger } = Upload;
const { Text } = Typography;

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: { key: string; title: string }[];
  templateHeaders: string[];
  templateFilename: string;
  onImport: (data: Record<string, unknown>[]) => Promise<void>;
}

/**
 * 通用批量导入弹窗
 *
 * 支持 .xlsx / .xls / .csv，拖拽上传 → 解析 → 预览表格 → 确认导入。
 */
export function ImportModal({
  open,
  onClose,
  title,
  columns,
  templateHeaders,
  templateFilename,
  onImport,
}: ImportModalProps) {
  const { modal } = App.useApp();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const handleParse = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!mountedRef.current) return;
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const name = wb.SheetNames[0];
        if (!name || !wb.Sheets[name]) {
          setFileList([]);
          modal.error({ title: "解析失败", content: "文件中没有找到有效的工作表" });
          return;
        }
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets[name]);
        setData(json);
      } catch {
        setFileList([]);
        modal.error({ title: "解析失败", content: "请检查文件格式是否正确" });
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // 阻止 Upload 自动上传
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      await onImport(data);
      setData([]);
      setFileList([]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setData([]);
    setFileList([]);
    onClose();
  };

  // 下载模板
  const downloadTemplate = () => {
    const csv = "﻿" + templateHeaders.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewColumns = columns.map((c) => ({
    title: c.title,
    dataIndex: c.key,
    key: c.key,
    ellipsis: true,
  }));

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      width={800}
      footer={
        <Space>
          <Button onClick={downloadTemplate}>
            <DownloadOutlined /> 下载模板
          </Button>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" loading={loading} disabled={data.length === 0} onClick={handleImport}>
            导入 {data.length} 条数据
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Dragger
        accept=".xlsx,.xls,.csv"
        maxCount={1}
        fileList={fileList}
        beforeUpload={handleParse}
        onChange={({ fileList: fl }) => setFileList(fl)}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">支持 .xlsx / .xls / .csv 格式</p>
      </Dragger>

      {data.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">已解析 {data.length} 条数据（预览前 20 条）</Text>
          <Table
            columns={previewColumns}
            dataSource={data.slice(0, 20)}
            rowKey={(_, i) => String(i)}
            size="small"
            pagination={false}
            scroll={{ x: 600 }}
            style={{ marginTop: 8 }}
          />
        </div>
      )}
    </Modal>
  );
}
