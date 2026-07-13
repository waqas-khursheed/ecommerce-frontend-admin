import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarCell({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-8">
        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
