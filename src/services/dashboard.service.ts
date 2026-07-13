import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";

export const dashboardService = {
  getOverview: <TOverview>() =>
    http.get<ApiSuccessResponse<TOverview>>("/admin/dashboard/overview").then((res) => res.data.data),

  getOrderStats: <TOrderStats>() =>
    http.get<ApiSuccessResponse<TOrderStats>>("/admin/dashboard/order-stats").then((res) => res.data.data),

  getTopProducts: <TTopProducts>(limit?: number) =>
    http
      .get<ApiSuccessResponse<TTopProducts>>("/admin/dashboard/top-products", { params: { limit } })
      .then((res) => res.data.data),

  getSalesReport: <TSalesReport>(from?: string, to?: string) =>
    http
      .get<ApiSuccessResponse<TSalesReport>>("/admin/dashboard/sales-report", { params: { from, to } })
      .then((res) => res.data.data),
};
