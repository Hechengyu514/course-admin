import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

async function bootstrap() {
  // 启动 MSW 拦截 HTTP 请求（纯前端演示，始终启用）
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: {
      url: import.meta.env.BASE_URL + "mockServiceWorker.js",
    },
  });

  // 页面刷新时，从 localStorage 恢复共享数据快照到 data.ts 内存数组
  // 否则 refresh 后 data.ts 回到种子数据，之前的所有修改丢失
  const { restoreSnapshot } = await import("./mocks/data");
  restoreSnapshot();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

bootstrap();
