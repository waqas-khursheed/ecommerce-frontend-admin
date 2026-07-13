"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
  data: { label: string; value: number }[];
}

interface ChartCardProps {
  title: string;
  description?: string;
  series: ChartSeries[];
  valuePrefix?: string;
}

export function ChartCard({ title, description, series, valuePrefix = "$" }: ChartCardProps) {
  const [active, setActive] = useState(series[0]?.key);
  const current = series.find((s) => s.key === active) ?? series[0];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {series.length > 1 && (
          <Tabs value={active} onValueChange={setActive}>
            <TabsList>
              {series.map((s) => (
                <TabsTrigger key={s.key} value={s.key}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={current.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={current.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={current.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => `${valuePrefix}${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
              }}
              formatter={(value) => [`${valuePrefix}${Number(value).toLocaleString()}`, current.label]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={current.color}
              strokeWidth={2}
              fill="url(#chart-fill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
