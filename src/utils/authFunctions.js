import apiClient from "./apiClient";
import { clearAll } from "./localStorage";

const getErrorMessage = (error, fallbackMessage) => {
  const backendMessage = error?.response?.data?.message;

  if (Array.isArray(backendMessage)) {
    return backendMessage.join(", ");
  }

  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return backendMessage;
  }

  return fallbackMessage;
};

export const registerUser = async (firstName, lastName, email, password) => {
  try {
    const response = await apiClient.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });

    return { status: true, data: response.data };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, "Registration failed."),
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
  } catch {
    // Intentionally ignored to always resolve and clear local state.
  } finally {
    clearAll();
  }

  return { status: true };
};

export const refreshTokens = async (refreshToken) => {
  try {
    const response = await apiClient.post("/auth/refresh-tokens", {
      refreshToken,
    });

    return { status: true, data: response.data };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, "Unable to refresh tokens."),
    };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });

    return {
      status: true,
      message:
        response?.data?.message ||
        "If this email exists, a reset link was sent.",
    };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(
        error,
        "Unable to process forgot password request.",
      ),
    };
  }
};

export const resendVerificationEmail = async (email) => {
  try {
    const response = await apiClient.post("/auth/resend-verification", { email });
    return { status: true, message: response?.data?.message || "Verification email sent." };
  } catch (error) {
    return {
      status: false,
      message: getErrorMessage(error, "Failed to resend verification email."),
    };
  }
};

/**
 * Maps user roles to their respective dashboard or landing paths.
 * @param {string} role - The user role string from the backend.
 * @returns {string} The path to redirect to.
 */
export const getRedirectPathByRole = (role) => {
  const map = {
    customer: "/",
    vendor: "/vendor",
    admin: "/admin",
    technical_support: "/support",
  };
  return map[role] || "/auth";
};
