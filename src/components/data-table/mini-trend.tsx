import { Area, AreaChart, ResponsiveContainer } from "recharts";

const UP_DATA = [{ v: 4 }, { v: 6 }, { v: 5 }, { v: 8 }, { v: 7 }, { v: 10 }];
const DOWN_DATA = [{ v: 10 }, { v: 8 }, { v: 9 }, { v: 6 }, { v: 7 }, { v: 4 }];

export function MiniTrend({ direction }: { direction: "up" | "down" }) {
  const isUp = direction === "up";
  const color = isUp ? "var(--chart-1)" : "var(--destructive)";

  return (
    <div className="h-6 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={isUp ? UP_DATA : DOWN_DATA} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill="none" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
