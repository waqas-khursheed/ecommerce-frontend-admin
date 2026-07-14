export interface ApiSuccessResponse<T = unknown> {
  status: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: false;
  message: string;
  // Joi validation failures (422) return an array of message strings;
  // some hand-written errors (e.g. admin login) return a field-keyed object.
  errors: Record<string, string> | string[] | null;
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
