import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth";

export type Address = {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault?: boolean;
};

export type AuthUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role?: string;
  phoneVerified: boolean;
  totalSpent?: number;
  loyaltyTier?: "Enthusiast" | "Elite" | "Master";
  addresses: Address[];
  wallet?: {
    balance: number;
    transactions: {
      type: "credit" | "debit";
      amount: number;
      description: string;
      date: string;
    }[];
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: { email?: string; emailOrPhone?: string; password: string }) => Promise<void>;
  register: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }

      const response = await authApi.me();
      setUser(response.data.user);
    } catch {
      setUser(null);
      await clearAuthToken();
    }
  };

  useEffect(() => {
    async function bootstrap() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login: async (payload) => {
      const response = await authApi.login(payload);
      await setAuthToken(response.token);
      setUser(response.data.user);
    },
    register: async (payload) => {
      const response = await authApi.register(payload);
      await setAuthToken(response.token);
      setUser(response.data.user);
    },
    logout: async () => {
      await clearAuthToken();
      setUser(null);
    },
    refreshUser,
    setUser
  }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
