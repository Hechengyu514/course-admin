import { App as AntApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import AppRouter from "./router";

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: "#4e6ef2",
          colorBgContainer: "#ffffff",
          colorBorder: "#f0f0f0",
          borderRadius: 6,
          fontSize: 14,
        },
      }}
    >
      <AntApp>
        <AppRouter />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
