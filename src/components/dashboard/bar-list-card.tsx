import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarListCardProps {
  title: string;
  description?: string;
  items: { label: string; value: number }[];
  formatValue?: (value: number) => string;
}

export function BarListCard({ title, description, items, formatValue }: BarListCardProps) {
  const max = Math.max(...items.map((item) => item.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{formatValue ? formatValue(item.value) : item.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
