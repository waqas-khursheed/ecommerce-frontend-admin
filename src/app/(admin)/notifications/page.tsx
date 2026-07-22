"use client";

import { useState } from "react";
import { Bell, ChevronLeft, ChevronRight, MessageSquareText, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { notificationService } from "@/services/notification.service";

function iconFor(tableName: string) {
  const key = tableName.toLowerCase();
  if (key.includes("order")) return ShoppingCart;
  if (key.includes("review")) return MessageSquareText;
  return Bell;
}

export default function NotificationsPage() {
  const { items: rows, setItems: setRows, isLoading, pagination } = usePaginatedList(
    (params) => notificationService.list(params),
    { pageSize: 10, errorMessage: "Failed to load notifications" }
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    } finally {
      setDeletingId(null);
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.n_title}</p>
                    {!n.seen && <Badge className="px-1.5 py-0 text-[10px]">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.n_desc}</p>
                  <p className="text-xs text-muted-foreground/70">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label="Delete notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(n.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Card>
            );
          })
        )}
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Previous page"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Next page"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this notification?"
        onConfirm={() => remove(deletingId!)}
      />
    </div>
  );
}
