/**
 * Application-wide constants
 */

export const APP_NAME = "TradePlatform";
export const APP_VERSION = "1.0.0";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 150,
  RESIZE: 100,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  AUTH_USER: "auth_user",
  DASHBOARD_MODE: "dashboard_mode",
  THEME: "tradeplatform-theme",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;
