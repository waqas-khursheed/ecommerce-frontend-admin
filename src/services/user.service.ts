import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams } from "@/types/api";

export const userService = {
  list: <TUser>(params?: ListQueryParams) =>
    http.get<ApiSuccessResponse<TUser[]>>("/admin/user", { params }).then((res) => res.data.data),

  getById: <TUser>(id: number | string) =>
    http.get<ApiSuccessResponse<TUser>>(`/admin/user/${id}`).then((res) => res.data.data),

  toggleStatus: <TUser>(id: number | string) =>
    http.patch<ApiSuccessResponse<TUser>>(`/admin/user/${id}/status`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/user/${id}`).then((res) => res.data.data),
};
