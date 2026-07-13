export interface ApiSuccessResponse<T = unknown> {
  status: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: false;
  message: string;
  errors: Record<string, string> | null;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}
