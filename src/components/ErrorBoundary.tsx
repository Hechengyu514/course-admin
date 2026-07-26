import { Component, type ReactNode } from "react";
import { Button, Result } from "antd";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  /** 每次重试递增，用作 key 来强制重新挂载子组件 */
  retryKey: number;
}

/**
 * 错误边界
 *
 * 捕获子组件树中的渲染错误，显示友好提示 + 重试按钮。
 * 点击重试会递增 key 来强制重新挂载子树，真正"重试"
 * （而非仅重置错误状态、让同一个错误立即再次触发）。
 * 用于包裹 Suspense，防止懒加载失败导致白屏。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, retryKey: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary] 捕获到渲染错误:", error.message, info.componentStack);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="页面加载失败"
          subTitle={this.state.error?.message ?? "未知错误，请重试"}
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              重试
            </Button>
          }
        />
      );
    }
    return (
      <div key={this.state.retryKey} style={{ display: "contents" }}>
        {this.props.children}
      </div>
    );
  }
}
