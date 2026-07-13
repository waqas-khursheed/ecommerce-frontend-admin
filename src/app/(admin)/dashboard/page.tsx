"use client";

import dynamic from "next/dynamic";
import { DollarSign, Eye, Receipt, ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { ProgressListCard } from "@/components/dashboard/progress-list-card";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import {
  monthlyGoals,
  overviewStats,
  revenueChartSeries,
  topSellingProducts,
  trafficSources,
} from "@/lib/mock/dashboard";

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

const STAT_ICONS = [DollarSign, ShoppingCart, Receipt, Eye];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening with your business today."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={STAT_ICONS[i]}
            sparkline={stat.sparkline}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Overview"
          description="Monthly performance for the current year"
          series={revenueChartSeries}
        />
        <DonutLegendCard
          title="Traffic Sources"
          description="Where your visitors come from"
          data={trafficSources}
          centerValue="284K"
          centerLabel="Visits"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopProductsTable products={topSellingProducts} />
        </div>

        <ProgressListCard
          title="Monthly Goals"
          description="Target you've set for each month"
          goals={monthlyGoals}
        />
      </div>
    </div>
  );
}
