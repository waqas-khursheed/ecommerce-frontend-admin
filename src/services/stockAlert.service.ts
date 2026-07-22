import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { StockAlert } from "@/types/stockAlert";

export const stockAlertService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ stockAlerts: StockAlert[]; meta: PaginationMeta }>>("/admin/stock-alerts", {
        params,
      })
      .then((res) => ({ items: res.data.data.stockAlerts, meta: res.data.data.meta })),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/stock-alerts/${id}`).then((res) => res.data.data),
};
