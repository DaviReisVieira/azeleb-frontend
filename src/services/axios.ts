import axios, { AxiosInstance } from "axios";
import { parseCookies } from "nookies";

export function getAPIClient(ctx?: any): AxiosInstance {
  const { "nextAuth.accessToken": accessToken } = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3000",
  });

  api.interceptors.request.use((config) => {
    return config;
  });

  if (accessToken) {
    api.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return api;
}
