import axios from "axios";

const client = axios.create({
  baseURL: "/api",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截：自动带 token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：统一错误处理
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.message || "网络错误";
    console.error("[API Error]", msg);

    // 401 未授权：清除 token 并跳转登录页
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      // 仅在非登录页时跳转，避免死循环
      if (window.location.pathname !== "/login") {
        window.location.href = import.meta.env.BASE_URL + "login";
      }
    }

    return Promise.reject(err);
  },
);

export default client;
