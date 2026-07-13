import axios from "axios";

const client = axios.create({
  baseURL: "https://course-admin-server-production.up.railway.app/api",
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
    return Promise.reject(err);
  },
);

export default client;
