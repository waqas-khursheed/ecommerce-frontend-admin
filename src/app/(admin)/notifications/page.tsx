"use client";

import { useState } from "react";
import { Bell, MessageSquareText, PackageX, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { notifications as initialNotifications, type NotificationRow } from "@/lib/mock/notifications";

const TYPE_ICON: Record<NotificationRow["type"], typeof Bell> = {
  order: ShoppingCart,
  stock: PackageX,
  review: MessageSquareText,
  system: Bell,
};

export default function NotificationsPage() {
  const [rows, setRows] = useState<NotificationRow[]>(initialNotifications);

  const markAllRead = () => {
    setRows((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Recent activity across orders, stock, and reviews."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Notifications" }]}
        actions={
          <Button variant="outline" onClick={markAllRead}>
            Mark all as read
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        {rows.map((n) => {
          const Icon = TYPE_ICON[n.type];
          return (
            <Card
              key={n.id}
              className={cn(
                "flex-row items-start gap-3 p-4",
                !n.read && "border-primary/30 bg-primary/[0.03]"
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.detail}</p>
                <p className="text-xs text-muted-foreground/70">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
