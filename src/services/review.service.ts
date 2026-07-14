import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Review } from "@/types/review";

export const reviewService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ reviews: Review[]; meta: PaginationMeta }>>("/admin/review", { params })
      .then((res) => ({ items: res.data.data.reviews, meta: res.data.data.meta })),

  updateStatus: (id: number | string, status: 0 | 1 | 2) =>
    http.patch<ApiSuccessResponse<Review>>(`/admin/review/${id}/status`, { status }).then((res) => res.data.data),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/review/${id}`).then((res) => res.data.data),
};
