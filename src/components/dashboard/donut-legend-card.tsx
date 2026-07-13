"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutLegendCardProps {
  title: string;
  description?: string;
  data: DonutSlice[];
  centerValue: string;
  centerLabel: string;
}

export function DonutLegendCard({
  title,
  description,
  data,
  centerValue,
  centerLabel,
}: DonutLegendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <div className="relative size-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={42}
                outerRadius={60}
                paddingAngle={3}
                cornerRadius={6}
                stroke="none"
              >
                {data.map((slice) => (
                  <Cell key={slice.label} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold">{centerValue}</span>
            <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2.5">
          {data.map((slice) => (
            <li key={slice.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-muted-foreground">{slice.label}</span>
              </span>
              <span className="font-medium">{slice.value}%</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
