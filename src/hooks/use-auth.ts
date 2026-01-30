import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { authApi, User, LoginFormData, SignupFormData } from "@/lib/auth-api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginFormData) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupFormData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from stored data
  useEffect(() => {
    const storedUser = authApi.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(data);
      
      if (result.success && result.user && result.token) {
        authApi.storeAuth(result.user, result.token);
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, error: result.error || "Login failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const result = await authApi.signup(data);
      
      if (result.success && result.user && result.token) {
        authApi.storeAuth(result.user, result.token);
        setUser(result.user);
        return { success: true };
      }
      
      return { success: false, error: result.error || "Registration failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };
}

export { AuthContext };
