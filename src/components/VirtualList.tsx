import { useState, type ReactNode } from "react";

/**
 * 虚拟列表
 *
 * 只渲染可见区域的行，用 transform 定位。
 *
 * @param data         全部数据
 * @param rowHeight    每行高度（px，固定）
 * @param containerHeight  可视区域高度（px）
 * @param renderItem   行渲染函数
 */

interface VirtualListProps<T> {
  data: T[];
  rowHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
}

export function VirtualList<T>({
  data,
  rowHeight,
  containerHeight,
  renderItem,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(containerHeight / rowHeight) + 2; // +2 缓冲区，防止白屏
  const visibleItems = data.slice(startIndex, startIndex + visibleCount);
  const offsetY = startIndex * rowHeight;

  return (
    <div
      style={{ height: containerHeight, overflow: "auto" }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: data.length * rowHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => renderItem(item, startIndex + i))}
        </div>
      </div>
    </div>
  );
}
