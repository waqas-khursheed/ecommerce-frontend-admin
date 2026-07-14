import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { QueryForm, Subscriber } from "@/types/lead";

export const queryFormService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ queryForms: QueryForm[]; meta: PaginationMeta }>>("/admin/query-form", { params })
      .then((res) => ({ items: res.data.data.queryForms, meta: res.data.data.meta })),

  markSeen: (id: number | string) =>
    http.patch<ApiSuccessResponse<QueryForm>>(`/admin/query-form/${id}/seen`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/query-form/${id}`).then((res) => res.data.data),
};

export const subscriberService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ subscribers: Subscriber[]; meta: PaginationMeta }>>("/admin/subscriber", {
        params,
      })
      .then((res) => ({ items: res.data.data.subscribers, meta: res.data.data.meta })),

  toggleStatus: (id: number | string) =>
    http.patch<ApiSuccessResponse<Subscriber>>(`/admin/subscriber/${id}/status`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/subscriber/${id}`).then((res) => res.data.data),
};
