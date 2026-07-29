import axios from "axios";
import { getAccessToken, setAccessToken } from "../lib/accessToken";
import { AuthUserRefresh } from "./Refresh_token";


const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND || "/shoham",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, async (error) => {

  const originalRequest = error.config


  if (error.response?.status === 403 && error.response?.data?.message === "token has failed"
    && !originalRequest._retry && !originalRequest?.url?.includes("/api/v1/auth/refresh")) {

    originalRequest._retry = true

    try {

      const response = await AuthUserRefresh()

      const newToken = response.token;

      setAccessToken(newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`

      return api(originalRequest)

    } catch (error) {
      console.error("Refresh token failed", error)
      setAccessToken(null);
      window.location.href = "/login";
      return Promise.reject(error);
    }
  }

  return Promise.reject(error);

})

export default api;
