import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trendColor?: string;
  sparkline: number[];
}

export function StatCard({
  label,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconClassName,
  trendColor = "var(--chart-1)",
  sparkline,
}: StatCardProps) {
  const isPositive = change >= 0;
  const data = sparkline.map((v, i) => ({ i, v }));

  return (
    <Card className="gap-4 py-5">
      <CardHeader className="flex-row items-center justify-between px-5">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary",
            iconClassName
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5 font-medium",
              isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {isPositive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={trendColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={trendColor}
                strokeWidth={2}
                fill={`url(#spark-${label.replace(/\s+/g, "")})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
