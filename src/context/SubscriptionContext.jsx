import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import apiClient from "../utils/apiClient";

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setIsPro(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.get("/subscriptions/me");
      const sub = res.data.subscription;
      setSubscription(sub);
      
      if (sub && sub.status === "active" && new Date(sub.expiresAt) > new Date()) {
        setIsPro(true);
      } else {
        setIsPro(false);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
      setIsPro(false);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [isAuthenticated]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isPro,
        isLoading,
        refreshSubscription: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
