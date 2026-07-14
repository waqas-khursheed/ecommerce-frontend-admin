"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquareText, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification";

function iconFor(tableName: string) {
  const key = tableName.toLowerCase();
  if (key.includes("order")) return ShoppingCart;
  if (key.includes("review")) return MessageSquareText;
  return Bell;
}

export default function NotificationsPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await notificationService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load notifications"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllSeen();
      setRows((prev) => prev.map((n) => ({ ...n, seen: 1 })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to mark all as read"));
    }
  };

  const markOneRead = async (id: number) => {
    try {
      await notificationService.markSeen(id);
      setRows((prev) => prev.map((n) => (n.id === id ? { ...n, seen: 1 } : n)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to mark as read"));
    }
  };

  const remove = async (id: number) => {
    try {
      await notificationService.remove(id);
      setRows((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete notification"));
    }
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
        {isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          rows.map((n) => {
            const Icon = iconFor(n.table_name);
            return (
              <Card
                key={n.id}
                className={cn(
                  "flex-row items-start gap-3 p-4",
                  !n.seen && "border-primary/30 bg-primary/[0.03]"
                )}
                onClick={() => !n.seen && markOneRead(n.id)}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium">{n.n_title}</p>
                  <p className="text-sm text-muted-foreground">{n.n_desc}</p>
                  <p className="text-xs text-muted-foreground/70">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.seen && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(n.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
