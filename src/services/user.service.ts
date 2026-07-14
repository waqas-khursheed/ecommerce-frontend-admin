import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Customer } from "@/types/customer";

export const userService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ users: Customer[]; meta: PaginationMeta }>>("/admin/user", { params })
      .then((res) => ({ items: res.data.data.users, meta: res.data.data.meta })),

  getById: (id: number | string) =>
    http.get<ApiSuccessResponse<Customer>>(`/admin/user/${id}`).then((res) => res.data.data),

  toggleStatus: (id: number | string) =>
    http.patch<ApiSuccessResponse<Customer>>(`/admin/user/${id}/status`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/user/${id}`).then((res) => res.data.data),
};
