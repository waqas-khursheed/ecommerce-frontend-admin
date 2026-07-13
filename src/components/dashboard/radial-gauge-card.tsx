"use client";

import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RadialGaugeCardProps {
  title: string;
  description?: string;
  percent: number;
  changeLabel?: string;
  note: string;
  footer: { label: string; value: string }[];
}

export function RadialGaugeCard({
  title,
  description,
  percent,
  changeLabel,
  note,
  footer,
}: RadialGaugeCardProps) {
  const data = [{ name: "target", value: percent, fill: "var(--primary)" }];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative size-36">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={data}
              startAngle={210}
              endAngle={-30}
              innerRadius="75%"
              outerRadius="100%"
              barSize={12}
            >
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--muted)" }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{percent}%</span>
            {changeLabel && (
              <span className="rounded-full bg-primary/10 px-1.5 text-[11px] font-medium text-primary">
                {changeLabel}
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">{note}</p>
        <div className="mt-4 grid w-full grid-cols-3 divide-x border-t pt-3 text-center">
          {footer.map((item) => (
            <div key={item.label} className="px-2">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
