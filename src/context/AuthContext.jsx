import { createContext, useState, useContext, useEffect } from "react";
import {
  clearAll,
  getAccessToken,
  getTokenStorageType,
  getUserData,
  setTokens,
  setUserData,
} from "../utils/localStorage";
import { logoutUser } from "../utils/authFunctions";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const storedUser = getUserData();
  const storedAccessToken = getAccessToken();
  const hasSession = Boolean(storedUser && storedAccessToken);
  const needsOnboardingInitial = Boolean(
    storedUser && storedUser.isOnboardingComplete === false,
  );

  const [user, setUser] = useState(hasSession ? storedUser : null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(hasSession);
  const [needsOnboarding, setNeedsOnboarding] = useState(
    needsOnboardingInitial,
  );

  useEffect(() => {
    queueMicrotask(() => {
      setIsLoading(false);
    });
  }, []);

  const login = (userData, accessToken, refreshToken, rememberMe = true) => {
    setTokens(accessToken, refreshToken, rememberMe);
    setUserData(userData);
    setUser(userData);
    setIsAuthenticated(true);
    setNeedsOnboarding(userData?.isOnboardingComplete === false);
  };

  const completeOnboarding = (updatedUser) => {
    const rememberMe = getTokenStorageType() === "local";
    setUser(updatedUser);
    setUserData(updatedUser, rememberMe);
    setNeedsOnboarding(false);
  };

  const logout = async () => {
    await logoutUser();
    clearAll();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/auth";
  };

  const userRole = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        userRole,
        needsOnboarding,
        login,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
