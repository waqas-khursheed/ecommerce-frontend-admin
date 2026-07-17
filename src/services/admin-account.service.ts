import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Admin, CreateAdminPayload } from "@/types/auth";

// Super-admin-only management of other admin accounts — backed/src/modules/auth/routes/admin.management.routes.js.
export const adminAccountService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ admins: Admin[]; meta: PaginationMeta }>>("/admin/admins", { params })
      .then((res) => ({ items: res.data.data.admins, meta: res.data.data.meta })),

  create: (payload: CreateAdminPayload) =>
    http.post<ApiSuccessResponse<Admin>>("/admin/admins", payload).then((res) => res.data.data),

  toggleStatus: (id: number | string) =>
    http.patch<ApiSuccessResponse<Admin>>(`/admin/admins/${id}/status`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/admins/${id}`).then((res) => res.data.data),
};
