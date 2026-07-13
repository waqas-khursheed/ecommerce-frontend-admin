import type { ChartSeries } from "@/components/dashboard/chart-card";
import type { DonutSlice } from "@/components/dashboard/donut-legend-card";
import type { ProgressGoal } from "@/components/dashboard/progress-list-card";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const overviewStats = [
  { label: "Total Sales", value: "$34,456.00", change: 14, sparkline: [12, 18, 14, 22, 19, 26, 24, 30] },
  { label: "Monthly Orders", value: "3,456", change: -17, sparkline: [30, 26, 28, 22, 24, 18, 20, 16] },
  { label: "Monthly Revenue", value: "$1,456.00", change: 14, sparkline: [10, 14, 12, 18, 16, 22, 20, 25] },
  { label: "Online Visitors", value: "42,456", change: -11, sparkline: [28, 24, 26, 20, 22, 17, 19, 15] },
];

export const revenueChartSeries: ChartSeries[] = [
  {
    key: "revenue",
    label: "Revenue",
    color: "var(--chart-1)",
    data: MONTHS.map((label, i) => ({ label, value: 8000 + i * 1600 + (i % 3) * 900 })),
  },
  {
    key: "orders",
    label: "Orders",
    color: "var(--chart-2)",
    data: MONTHS.map((label, i) => ({ label, value: 900 + i * 60 + (i % 4) * 40 })),
  },
  {
    key: "profit",
    label: "Profit",
    color: "var(--chart-3)",
    data: MONTHS.map((label, i) => ({ label, value: 3000 + i * 500 + (i % 5) * 300 })),
  },
];

export const trafficSources: DonutSlice[] = [
  { label: "Direct", value: 35, color: "var(--chart-1)" },
  { label: "Organic", value: 28, color: "var(--chart-2)" },
  { label: "Referral", value: 22, color: "var(--chart-3)" },
  { label: "Social", value: 15, color: "var(--chart-4)" },
];

export const monthlyGoals: ProgressGoal[] = [
  { label: "Monthly Revenue", percent: 88, current: "$48,295", target: "$55,000" },
  { label: "New Customers", percent: 85, current: "847", target: "1,000" },
  { label: "Conversion Rate", percent: 76, current: "3.24%", target: "4.20%" },
];

export const topSellingProducts = [
  { name: "Shirt", price: 76.89, category: "Man Clothes", quantity: 128, amount: 6647.15 },
  { name: "T-Shirt", price: 79.8, category: "Women Clothes", quantity: 89, amount: 6647.15 },
  { name: "Pant", price: 86.65, category: "Kid Clothes", quantity: 74, amount: 6647.15 },
  { name: "Sweater", price: 56.07, category: "Man Clothes", quantity: 69, amount: 6647.15 },
  { name: "Light Jacket", price: 36.0, category: "Women Clothes", quantity: 65, amount: 6647.15 },
  { name: "Half Shirt", price: 46.78, category: "Man Clothes", quantity: 58, amount: 6647.15 },
];

export const salesByLocation = [
  { city: "New York", value: 72 },
  { city: "San Francisco", value: 39 },
  { city: "Sydney", value: 25 },
  { city: "Singapore", value: 61 },
];

export const orderStatusBreakdown: DonutSlice[] = [
  { label: "Completed", value: 584, color: "var(--chart-1)" },
  { label: "Processing", value: 234, color: "var(--chart-2)" },
  { label: "Pending", value: 127, color: "var(--chart-4)" },
  { label: "Cancelled", value: 47, color: "var(--chart-5)" },
];

export const analyticsStats = [
  { label: "Total Sales", value: "$34,456.00", change: 14, sparkline: [12, 18, 14, 22, 19, 26, 24, 30] },
  { label: "Total Order", value: "3,456", change: -17, sparkline: [30, 26, 28, 22, 24, 18, 20, 16] },
  { label: "Total Revenue", value: "$1,456.00", change: 14, sparkline: [10, 14, 12, 18, 16, 22, 20, 25] },
  { label: "Total Customer", value: "42,456", change: -11, sparkline: [28, 24, 26, 20, 22, 17, 19, 15] },
];

export const revenueComparison = [
  { key: "current", label: "Current Week", color: "var(--chart-1)", total: "$58,211" },
  { key: "previous", label: "Previous Week", color: "var(--chart-3)", total: "$68,768" },
];

export const revenueComparisonData = MONTHS.slice(0, 6).map((label, i) => ({
  label,
  current: 8000 + i * 2500 + (i % 3) * 1200,
  previous: 12000 + Math.sin(i) * 4000 + i * 800,
}));

export const salesChannels: DonutSlice[] = [
  { label: "Direct", value: 300.56, color: "var(--chart-1)" },
  { label: "Affiliate", value: 135.18, color: "var(--chart-2)" },
  { label: "Sponsored", value: 154.02, color: "var(--chart-3)" },
  { label: "E-mail", value: 48.96, color: "var(--chart-4)" },
];

export const monthlyTarget = {
  percent: 75.34,
  changeLabel: "+12%",
  note: "You earn $3,267 today, it's higher than last month. Keep up your good trends!",
  footer: [
    { label: "Target", value: "$25k" },
    { label: "Revenue", value: "$18k" },
    { label: "Today", value: "$1.8k" },
  ],
};
