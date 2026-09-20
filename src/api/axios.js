import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.debug("[Frontend] API request", {
    method: (config.method || "get").toUpperCase(),
    url: `${config.baseURL || ""}${config.url}`,
    hasToken: Boolean(token),
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.debug("[Frontend] API response", {
      status: response.status,
      url: `${response.config?.baseURL || ""}${response.config?.url || ""}`,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[Frontend] API error", {
      status: error.response?.status,
      url: `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export default api;
