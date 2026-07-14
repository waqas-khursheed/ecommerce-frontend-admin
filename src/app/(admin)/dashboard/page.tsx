"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { DollarSign, Package, Receipt, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { ProgressListCard, type ProgressGoal } from "@/components/dashboard/progress-list-card";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import type { ChartSeries } from "@/components/dashboard/chart-card";
import type { DonutSlice } from "@/components/dashboard/donut-legend-card";
import { getApiErrorMessage } from "@/lib/apiError";
import { dashboardService } from "@/services/dashboard.service";
import { ORDER_STATUS_LABELS } from "@/types/order";
import type { DashboardOverview, OrderStats, SalesReportItem, TopProductItem } from "@/types/dashboard";

// recharts measures the DOM to render, so these are loaded client-only to avoid SSR.
const StatCard = dynamic(() => import("@/components/dashboard/stat-card").then((m) => m.StatCard), {
  ssr: false,
});
const ChartCard = dynamic(() => import("@/components/dashboard/chart-card").then((m) => m.ChartCard), {
  ssr: false,
});
const DonutLegendCard = dynamic(
  () => import("@/components/dashboard/donut-legend-card").then((m) => m.DonutLegendCard),
  { ssr: false }
);

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function last30DaysRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { from, to } = last30DaysRange();
        const [overviewRes, orderStatsRes, topProductsRes, salesReportRes] = await Promise.all([
          dashboardService.getOverview(),
          dashboardService.getOrderStats(),
          dashboardService.getTopProducts(5),
          dashboardService.getSalesReport(from, to),
        ]);
        setOverview(overviewRes);
        setOrderStats(orderStatsRes);
        setTopProducts(topProductsRes);
        setSalesReport(salesReportRes);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load dashboard data"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading || !overview || !orderStats) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" description="Loading your business overview..." />
      </div>
    );
  }

  const revenueSeries: ChartSeries[] = [
    {
      key: "revenue",
      label: "Revenue",
      color: "var(--chart-1)",
      data: salesReport.map((d) => ({ label: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: d.revenue })),
    },
  ];

  const statusTotal = orderStats.statusCounts.reduce((sum, s) => sum + s.count, 0) || 1;
  const statusDonut: DonutSlice[] = orderStats.statusCounts.map((s, i) => ({
    label: ORDER_STATUS_LABELS[s.status] ?? `Status ${s.status}`,
    value: Math.round((s.count / statusTotal) * 100),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const paymentTotal = orderStats.paymentStatusCounts.reduce((sum, s) => sum + s.count, 0) || 1;
  const paymentGoals: ProgressGoal[] = orderStats.paymentStatusCounts.map((s) => ({
    label: s.paymentStatus,
    percent: Math.round((s.count / paymentTotal) * 100),
    current: `${s.count} orders`,
    target: `${paymentTotal} total`,
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
        title="Dashboard"
        description="Welcome back. Here's what's happening with your business today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={`$${overview.totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Total Orders" value={overview.totalOrders.toLocaleString()} icon={Receipt} />
        <StatCard label="Total Products" value={overview.totalProducts.toLocaleString()} icon={Package} />
        <StatCard label="Active Customers" value={`${overview.activeUsers} / ${overview.totalUsers}`} icon={Users} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Revenue" description="Last 30 days (paid orders)" series={revenueSeries} />
        {statusDonut.length > 0 && (
          <DonutLegendCard
            title="Orders by Status"
            description="Breakdown of all orders"
            data={statusDonut}
            centerValue={String(overview.totalOrders)}
            centerLabel="Orders"
          />
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopProductsTable products={topProductRows} />
        </div>

        {paymentGoals.length > 0 && (
          <ProgressListCard title="Payment Status" description="Share of all orders" goals={paymentGoals} />
        )}
      </div>
    </div>
  );
}
