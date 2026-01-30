import { z } from "zod";

// Validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(50, "Last name must be less than 50 characters"),
    companyName: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(100, "Company name must be less than 100 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Invalid email address")
      .max(255, "Email must be less than 255 characters"),
    industry: z.enum(["buyer", "producer", "seller", "other"], {
      required_error: "Please select an industry",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  industry?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// API Configuration - Update these to point to your backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

/**
 * Auth API abstraction layer
 * Replace the implementation with your own backend calls
 */
export const authApi = {
  /**
   * Login with email and password
   * TODO: Connect to your backend endpoint
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      // Example: Replace with your actual API call
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || "Invalid credentials",
        };
      }

      const result = await response.json();
      return {
        success: true,
        user: result.user,
        token: result.token,
      };
    } catch (error) {
      // For demo purposes - remove this in production
      console.warn("API not connected. Using demo mode.");
      
      // Demo mode - simulates successful login
      if (data.email && data.password) {
        return {
          success: true,
          user: {
            id: "demo-user-1",
            email: data.email,
            firstName: "Demo",
            lastName: "User",
          },
          token: "demo-token-xyz",
        };
      }
      
      return {
        success: false,
        error: "Unable to connect to server",
      };
    }
  },

  /**
   * Register a new user
   * TODO: Connect to your backend endpoint
   */
  async signup(data: SignupFormData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          email: data.email,
          industry: data.industry,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || "Registration failed",
        };
      }

      const result = await response.json();
      return {
        success: true,
        user: result.user,
        token: result.token,
      };
    } catch (error) {
      // For demo purposes - remove this in production
      console.warn("API not connected. Using demo mode.");
      
      // Demo mode - simulates successful registration
      return {
        success: true,
        user: {
          id: "demo-user-" + Date.now(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          companyName: data.companyName,
          industry: data.industry,
        },
        token: "demo-token-" + Date.now(),
      };
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      // Silently handle logout errors
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  /**
   * Get the current authenticated user from stored token
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Store authentication data
   */
  storeAuth(user: User, token: string): void {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },
};
