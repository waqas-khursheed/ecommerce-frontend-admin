import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type { DashboardOverview, OrderStats, SalesReportItem, TopProductItem } from "@/types/dashboard";

export const dashboardService = {
  getOverview: () =>
    http.get<ApiSuccessResponse<DashboardOverview>>("/admin/dashboard/overview").then((res) => res.data.data),

  getOrderStats: () =>
    http.get<ApiSuccessResponse<OrderStats>>("/admin/dashboard/order-stats").then((res) => res.data.data),

  getTopProducts: (limit?: number) =>
    http
      .get<ApiSuccessResponse<{ topProducts: TopProductItem[] }>>("/admin/dashboard/top-products", {
        params: { limit },
      })
      .then((res) => res.data.data.topProducts),

  getSalesReport: (from?: string, to?: string) =>
    http
      .get<ApiSuccessResponse<{ salesReport: SalesReportItem[] }>>("/admin/dashboard/sales-report", {
        params: { from, to },
      })
      .then((res) => res.data.data.salesReport),
};
