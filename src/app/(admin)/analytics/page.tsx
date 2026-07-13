"use client";

import dynamic from "next/dynamic";
import { DollarSign, Receipt, TrendingUp, Users } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { BarListCard } from "@/components/dashboard/bar-list-card";
import { TopProductsTable } from "@/components/dashboard/top-products-table";
import {
  analyticsStats,
  monthlyTarget,
  revenueComparison,
  revenueComparisonData,
  salesByLocation,
  salesChannels,
  topSellingProducts,
} from "@/lib/mock/dashboard";

// recharts measures the DOM to render, so these are loaded client-only to avoid SSR.
const StatCard = dynamic(() => import("@/components/dashboard/stat-card").then((m) => m.StatCard), {
  ssr: false,
});
const DonutLegendCard = dynamic(
  () => import("@/components/dashboard/donut-legend-card").then((m) => m.DonutLegendCard),
  { ssr: false }
);
const RadialGaugeCard = dynamic(
  () => import("@/components/dashboard/radial-gauge-card").then((m) => m.RadialGaugeCard),
  { ssr: false }
);
const RevenueComparisonChart = dynamic(
  () => import("@/components/dashboard/revenue-comparison-chart").then((m) => m.RevenueComparisonChart),
  { ssr: false }
);

const STAT_ICONS = [DollarSign, Receipt, TrendingUp, Users];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Report Analysis"
        description="Track your business performance and key metrics."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Report Analysis" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsStats.map((stat, i) => (
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
        <RevenueComparisonChart series={revenueComparison} data={revenueComparisonData} />

        <BarListCard
          title="Sales By Location"
          items={salesByLocation.map((l) => ({ label: l.city, value: l.value }))}
          formatValue={(v) => `${v}k`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopProductsTable products={topSellingProducts} />
        </div>

        <div className="flex flex-col gap-4">
          <DonutLegendCard
            title="Total Sales"
            data={salesChannels}
            centerValue="38.6%"
            centerLabel="Direct"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <RadialGaugeCard
          title="Monthly Target"
          description="Target you've set for each month"
          percent={monthlyTarget.percent}
          changeLabel={monthlyTarget.changeLabel}
          note={monthlyTarget.note}
          footer={monthlyTarget.footer}
        />
      </div>
    </div>
  );
}
