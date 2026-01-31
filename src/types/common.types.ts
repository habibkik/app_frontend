/**
 * Common types used across the application
 */

export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface FilterOption extends SelectOption {
  count?: number;
}

export type Status = "pending" | "active" | "completed" | "cancelled" | "error";

export interface StatusConfig {
  label: string;
  color: string;
  icon?: string;
}

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
