/**
 * API endpoint constants
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
  },

  // Users
  USERS: {
    ME: "/users/me",
    UPDATE_PROFILE: "/users/profile",
    UPDATE_PASSWORD: "/users/password",
  },

  // Suppliers
  SUPPLIERS: {
    LIST: "/suppliers",
    SEARCH: "/suppliers/search",
    DETAIL: (id: string) => `/suppliers/${id}`,
    SAVE: (id: string) => `/suppliers/${id}/save`,
    UNSAVE: (id: string) => `/suppliers/${id}/unsave`,
    CONTACT: (id: string) => `/suppliers/${id}/contact`,
  },

  // RFQs
  RFQS: {
    LIST: "/rfqs",
    CREATE: "/rfqs",
    DETAIL: (id: string) => `/rfqs/${id}`,
    UPDATE: (id: string) => `/rfqs/${id}`,
    DELETE: (id: string) => `/rfqs/${id}`,
    SUBMIT: (id: string) => `/rfqs/${id}/submit`,
  },

  // Products
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    DETAIL: (id: string) => `/products/${id}`,
    UPLOAD: "/products/upload",
    ANALYZE: "/products/analyze",
  },

  // BOM
  BOM: {
    LIST: "/bom",
    CREATE: "/bom",
    DETAIL: (id: string) => `/bom/${id}`,
    ANALYZE: "/bom/analyze",
    EXPORT: (id: string) => `/bom/${id}/export`,
  },

  // Market Intelligence
  MARKET: {
    SEARCH: "/market/search",
    ANALYSIS: "/market/analysis",
    TRENDS: "/market/trends",
    COMPETITORS: "/market/competitors",
    PRICING: "/market/pricing",
  },

  // Conversations
  CONVERSATIONS: {
    LIST: "/conversations",
    DETAIL: (id: string) => `/conversations/${id}`,
    MESSAGES: (id: string) => `/conversations/${id}/messages`,
    SEND: (id: string) => `/conversations/${id}/send`,
  },

  // Analytics
  ANALYTICS: {
    OVERVIEW: "/analytics/overview",
    SUPPLIERS: "/analytics/suppliers",
    RFQS: "/analytics/rfqs",
    REVENUE: "/analytics/revenue",
  },

  // Competitors
  COMPETITORS: {
    MONITOR: "/competitors/monitor",
    REFRESH: "/competitors/refresh",
    DATA: (productId: string) => `/competitors/${productId}`,
    DETAILS: (competitorId: string) => `/competitors/details/${competitorId}`,
    HISTORY: (competitorId: string) => `/competitors/${competitorId}/history`,
    AUTO_REFRESH: "/competitors/auto-refresh",
  },

  // Alerts
  ALERTS: {
    DISMISS: (alertId: string) => `/alerts/${alertId}/dismiss`,
    LIST: "/alerts",
    ACKNOWLEDGE: (alertId: string) => `/alerts/${alertId}/acknowledge`,
  },
} as const;
