import axios from "axios";
import {
  clearAll,
  getAccessToken,
  getRefreshToken,
  getTokenStorageType,
  setTokens,
} from "./localStorage";

const baseURL = import.meta.env.VITE_API_URL;

function createApiClient(contentType = "application/json") {
  const headers = {};

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return axios.create({
    baseURL,
    headers,
  });
}

function attachAuthInterceptor(client) {
  client.interceptors.request.use(
    (config) => {
      const accessToken = getAccessToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      const cartId = localStorage.getItem("cartId");
      if (cartId) {
        config.headers["x-cart-id"] = cartId;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  return client;
}

function attachResponseInterceptor(client, retryClient) {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error?.response?.status !== 401 || originalRequest?._retry) {
        return Promise.reject(error);
      }

      if (originalRequest?.url?.includes("/auth/refresh-tokens")) {
        clearAll();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAll();
        window.location.href = "/auth";
        return Promise.reject(error);
      }

      try {
        originalRequest._retry = true;

        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-tokens`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;
        const rememberMe = getTokenStorageType() === "local";
        setTokens(accessToken, newRefreshToken, rememberMe);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return retryClient(originalRequest);
      } catch (refreshError) {
        clearAll();
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    },
  );

  return client;
}

const apiClient = attachAuthInterceptor(createApiClient());

export const multipartClient = attachAuthInterceptor(createApiClient(null));

attachResponseInterceptor(apiClient, apiClient);
attachResponseInterceptor(multipartClient, multipartClient);

export default apiClient;
