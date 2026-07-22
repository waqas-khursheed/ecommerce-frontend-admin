import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Order, PaymentStatus } from "@/types/order";

export const orderService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ orders: Order[]; meta: PaginationMeta }>>("/admin/order", { params })
      .then((res) => ({ items: res.data.data.orders, meta: res.data.data.meta })),

  getById: (id: number | string) =>
    http.get<ApiSuccessResponse<Order>>(`/admin/order/${id}`).then((res) => res.data.data),

  updateStatus: (id: number | string, status: number) =>
    http.patch<ApiSuccessResponse<Order>>(`/admin/order/${id}/status`, { status }).then((res) => res.data.data),

  updatePaymentStatus: (id: number | string, payment_status: PaymentStatus) =>
    http
      .patch<ApiSuccessResponse<Order>>(`/admin/order/${id}/payment-status`, { payment_status })
      .then((res) => res.data.data),

  markSeen: (id: number | string) =>
    http.patch<ApiSuccessResponse<Order>>(`/admin/order/${id}/seen`).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/order/${id}`).then((res) => res.data.data),

  bulkRemove: (ids: (number | string)[]) =>
    http
      .post<ApiSuccessResponse<{ deleted: number; requested: number }>>("/admin/order/bulk-delete", { ids })
      .then((res) => res.data.data),
};
