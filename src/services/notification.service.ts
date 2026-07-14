import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Notification } from "@/types/notification";

export const notificationService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ notifications: Notification[]; meta: PaginationMeta }>>("/admin/notification", {
        params,
      })
      .then((res) => ({ items: res.data.data.notifications, meta: res.data.data.meta })),

  markSeen: (id: number | string) =>
    http.patch<ApiSuccessResponse<Notification>>(`/admin/notification/${id}/seen`).then((res) => res.data.data),

  markAllSeen: () => http.patch<ApiSuccessResponse<null>>("/admin/notification/seen-all"),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/notification/${id}`).then((res) => res.data.data),
};
