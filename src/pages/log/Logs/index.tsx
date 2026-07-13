import { Card, Input, Space } from "antd";
import { useEffect, useMemo, useState } from "react";
import type { LogEntry } from "@/types";
import { getLogsAPI } from "@/api/log";
import { VirtualList } from "@/components/VirtualList";
import { debounce } from "@/utils/debounce";
import styles from "./Logs.module.css";

const ROW_HEIGHT = 52;
const CONTAINER_HEIGHT = 600;

/**
 * 系统日志（管理员端）
 *
 * 从后端加载操作日志，通过虚拟列表实现流畅滚动。
 * 支持按用户名搜索过滤。
 */
export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [userName, setUserName] = useState("");
  const debouncedSetUserName = useMemo(() => debounce((v: string) => setUserName(v), 300), []);

  useEffect(() => {
    getLogsAPI().then(setLogs);
  }, []);

  const filteredLogs = useMemo(
    () =>
      logs.filter((l) =>
        l.userName.toLowerCase().includes(userName.toLowerCase().trim()),
      ),
    [logs, userName],
  );

  const renderLogRow = (log: LogEntry, index: number) => (
    <div key={log.id} className={`${styles.row} ${index % 2 === 0 ? styles.even : styles.odd}`}>
      <span className={styles.col1}>{log.userName}</span>
      <span className={styles.col2}>{log.time}</span>
      <span className={styles.col1}>{log.action}</span>
      <span className={styles.col2}>{log.detail}</span>
    </div>
  );

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="输入用户名搜索"
          onSearch={debouncedSetUserName}
          onChange={(e) => { if (!e.target.value) setUserName(""); }}
          style={{ width: 240 }}
        />
      </Space>

      <div className={styles.wrapper}>
        <div className={`${styles.row} ${styles.headerRow}`}>
          <span className={styles.col1}>操作人</span>
          <span className={styles.col2}>时间</span>
          <span className={styles.col1}>操作类型</span>
          <span className={styles.col2}>详情</span>
        </div>

        <VirtualList
          data={filteredLogs}
          rowHeight={ROW_HEIGHT}
          containerHeight={CONTAINER_HEIGHT - ROW_HEIGHT}
          renderItem={renderLogRow}
        />
      </div>
    </Card>
  );
}
