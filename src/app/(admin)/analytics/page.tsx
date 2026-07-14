"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CalendarClock, DollarSign, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { BarListCard } from "@/components/dashboard/bar-list-card";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import type { DonutSlice } from "@/components/dashboard/donut-legend-card";
import { getApiErrorMessage } from "@/lib/apiError";
import { dashboardService } from "@/services/dashboard.service";
import { ORDER_STATUS_LABELS } from "@/types/order";
import type { DashboardOverview, OrderStats, TopProductItem } from "@/types/dashboard";

// recharts measures the DOM to render, so these are loaded client-only to avoid SSR.
const StatCard = dynamic(() => import("@/components/dashboard/stat-card").then((m) => m.StatCard), {
  ssr: false,
});
const DonutLegendCard = dynamic(
  () => import("@/components/dashboard/donut-legend-card").then((m) => m.DonutLegendCard),
  { ssr: false }
);

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [overviewRes, orderStatsRes, topProductsRes] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getOrderStats(),
          dashboardService.getTopProducts(10),
        ]);
        setOverview(overviewRes);
        setOrderStats(orderStatsRes);
        setTopProducts(topProductsRes);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load analytics data"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading || !overview || !orderStats) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Report Analysis" description="Loading..." />
      </div>
    );
  }

  const statusItems = orderStats.statusCounts.map((s) => ({
    label: ORDER_STATUS_LABELS[s.status] ?? `Status ${s.status}`,
    value: s.count,
  }));

  const paymentTotal = orderStats.paymentStatusCounts.reduce((sum, s) => sum + s.count, 0) || 1;
  const paymentDonut: DonutSlice[] = orderStats.paymentStatusCounts.map((s, i) => ({
    label: s.paymentStatus,
    value: Math.round((s.count / paymentTotal) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const topProductRows = topProducts.map((p) => ({
    name: p.product.title,
    price: p.totalQuantitySold > 0 ? p.totalRevenue / p.totalQuantitySold : 0,
    category: "—",
    quantity: p.totalQuantitySold,
    amount: p.totalRevenue,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Report Analysis"
        description="Track your business performance and key metrics."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Report Analysis" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Orders" value={overview.todayOrders.toLocaleString()} icon={ShoppingCart} />
        <StatCard label="Today's Revenue" value={`$${overview.todayRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Pending Orders" value={overview.pendingOrders.toLocaleString()} icon={CalendarClock} />
        <StatCard label="Total Products" value={overview.totalProducts.toLocaleString()} icon={Package} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {statusItems.length > 0 && (
          <div className="xl:col-span-2">
            <BarListCard title="Orders by Status" description="All-time breakdown" items={statusItems} />
          </div>
        )}
        {paymentDonut.length > 0 && (
          <DonutLegendCard
            title="Payment Status"
            description="Share of all orders"
            data={paymentDonut}
            centerValue={`${paymentTotal}`}
            centerLabel="Orders"
          />
        )}
      </div>

      <TopProductsTable title="Top 10 Products" products={topProductRows} />
    </div>
  );
}
