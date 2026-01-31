// Auth feature barrel export
export { AuthProvider } from "@/components/auth/AuthProvider";
export { ProtectedRoute, PublicRoute } from "@/components/auth/ProtectedRoute";
export { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

// Pages
export { default as LoginPage } from "@/pages/Login";
export { default as SignupPage } from "@/pages/Signup";

// Hooks
export { useAuth } from "@/hooks/use-auth";

// API and types
export { 
  authApi, 
  loginSchema, 
  signupSchema,
  type LoginFormData, 
  type SignupFormData,
  type User,
  type AuthResponse,
} from "@/lib/auth-api";
