import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

// 403 无权限页：RouteGuard 拦截后跳转至此
export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，你没有权限访问此页面"
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          返回首页
        </Button>
      }
    />
  );
}
