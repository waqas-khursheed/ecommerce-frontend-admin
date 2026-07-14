import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Exchange } from "@/types/exchange";

export const exchangeService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ exchanges: Exchange[]; meta: PaginationMeta }>>("/admin/exchange", { params })
      .then((res) => ({ items: res.data.data.exchanges, meta: res.data.data.meta })),

  markSeen: (id: number | string) =>
    http.patch<ApiSuccessResponse<Exchange>>(`/admin/exchange/${id}/seen`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/exchange/${id}`).then((res) => res.data.data),
};
