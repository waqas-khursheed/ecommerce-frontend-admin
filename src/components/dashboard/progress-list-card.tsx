import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export interface ProgressGoal {
  label: string;
  percent: number;
  current: string;
  target: string;
}

interface ProgressListCardProps {
  title: string;
  description?: string;
  goals: ProgressGoal[];
}

export function ProgressListCard({ title, description, goals }: ProgressListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-5">
        {goals.map((goal) => (
          <div key={goal.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{goal.label}</span>
              <span className="text-muted-foreground">{goal.percent}%</span>
            </div>
            <Progress value={goal.percent} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{goal.current}</span>
              <span>Target: {goal.target}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
