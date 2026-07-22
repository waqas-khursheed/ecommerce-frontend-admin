"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { ConfirmActionDialog } from "@/components/data-table/confirm-action-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exchangeService } from "@/services/exchange.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { uploadUrl } from "@/lib/http";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { EXCHANGE_STATUS_LABELS, type Exchange } from "@/types/exchange";

export default function ExchangesPage() {
  const {
    items: rows,
    setItems: setRows,
    isLoading,
    reload: loadExchanges,
    pagination,
    search,
    setSearch,
  } = usePaginatedList((params) => exchangeService.list(params), {
    pageSize: 10,
    errorMessage: "Failed to load exchange requests",
  });
  const [viewing, setViewing] = useState<Exchange | null>(null);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingAction, setPendingAction] = useState<1 | 2 | null>(null);

  const openExchange = async (row: Exchange) => {
    setViewing(row);
    setAdminNote(row.admin_note ?? "");
    setOpen(true);
    if (!row.seen) {
      try {
        await exchangeService.markSeen(row.id);
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, seen: 1 } : r)));
        setViewing((prev) => (prev ? { ...prev, seen: 1 } : prev));
      } catch {
        // non-fatal — the request still opens even if marking seen failed
      }
    }
  };

  const applyStatus = async (status: 1 | 2 | 3) => {
    if (!viewing) return;
    setIsUpdating(true);
    try {
      const updated = await exchangeService.updateStatus(viewing.id, { status, admin_note: adminNote });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setViewing(updated);
      toast.success(`Exchange request marked as ${EXCHANGE_STATUS_LABELS[status]}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update exchange request"));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await exchangeService.remove(deletingId);
      toast.success("Exchange request deleted");
      await loadExchanges();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete exchange request"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Exchange, unknown>[]>(
    () => [
      { accessorKey: "customer_name", header: "Customer" },
      { accessorKey: "order_number", header: "Order #", cell: ({ getValue }) => (getValue() as string) ?? "—" },
      {
        accessorKey: "return_item_name",
        header: "Return Item",
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        accessorKey: "created_at",
        header: "Submitted",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={EXCHANGE_STATUS_LABELS[getValue() as 0 | 1 | 2 | 3]} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8" aria-label="View exchange" onClick={() => openExchange(row.original)}>
              <Eye className="size-4" />
            </Button>
            <RowActions onDelete={() => setDeletingId(row.original.id)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Exchanges"
        description="Customer-submitted return/exchange requests."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exchanges" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search by customer..."
        searchColumn="customer_name"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
      />

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setViewing(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{viewing?.customer_name}</SheetTitle>
            <SheetDescription>
              {viewing?.order_number ? `Order ${viewing.order_number}` : "No order number provided"}
            </SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex-1 space-y-4 overflow-y-auto px-4 text-sm">
              <div className="flex items-center justify-between">
                <StatusBadge status={EXCHANGE_STATUS_LABELS[viewing.status]} />
                {viewing.order && (
                  <p className="text-muted-foreground">Order total: ${Number(viewing.order.grand_total).toFixed(2)}</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground">Email: {viewing.email ?? "—"}</p>
                <p className="text-muted-foreground">Phone: {viewing.phone_number ?? "—"}</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="font-medium">Returning</p>
                <div className="flex items-center gap-3">
                  {viewing.orderDetail?.product?.featured_image && (
                    <img
                      src={uploadUrl("products", viewing.orderDetail.product.featured_image) ?? undefined}
                      alt=""
                      className="size-12 shrink-0 rounded-md border object-cover"
                    />
                  )}
                  <div>
                    <p className="text-muted-foreground">
                      {viewing.orderDetail?.product?.title ?? viewing.return_item_name ?? "—"}
                      {viewing.orderDetail?.quantity ? ` × ${viewing.orderDetail.quantity}` : ""}
                    </p>
                    {viewing.return_item_size && (
                      <p className="text-xs text-muted-foreground">Variant: {viewing.return_item_size}</p>
                    )}
                    {viewing.return_item_code && (
                      <p className="text-xs text-muted-foreground">Code: {viewing.return_item_code}</p>
                    )}
                  </div>
                </div>
              </div>

              {(viewing.requestedStock || viewing.required_item_name) && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="font-medium">Requested in exchange</p>
                    <div className="flex items-center gap-3">
                      {viewing.requestedStock?.product?.featured_image && (
                        <img
                          src={uploadUrl("products", viewing.requestedStock.product.featured_image) ?? undefined}
                          alt=""
                          className="size-12 shrink-0 rounded-md border object-cover"
                        />
                      )}
                      <div>
                        <p className="text-muted-foreground">
                          {viewing.requestedStock?.product?.title ?? viewing.required_item_name ?? "—"}
                        </p>
                        {viewing.required_item_size && (
                          <p className="text-xs text-muted-foreground">Variant: {viewing.required_item_size}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-1">
                <p className="font-medium">Reason</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{viewing.reason ?? "—"}</p>
                {viewing.other_detail && (
                  <p className="text-muted-foreground whitespace-pre-wrap">{viewing.other_detail}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Label htmlFor="admin_note">Note to customer</Label>
                <Textarea
                  id="admin_note"
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={viewing.status === 2 || viewing.status === 3}
                  placeholder="Optional — included in the email sent to the customer"
                />
              </div>
            </div>
          )}
          <SheetFooter>
            {viewing?.status === 0 && (
              <>
                <Button onClick={() => setPendingAction(1)} disabled={isUpdating}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => setPendingAction(2)} disabled={isUpdating}>
                  Reject
                </Button>
              </>
            )}
            {viewing?.status === 1 && (
              <Button onClick={() => applyStatus(3)} disabled={isUpdating}>
                Mark as completed
              </Button>
            )}
            <SheetClose render={<Button variant="outline">Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this exchange request?"
        onConfirm={handleDelete}
      />

      <ConfirmActionDialog
        open={pendingAction !== null}
        onOpenChange={(v) => !v && setPendingAction(null)}
        title={pendingAction === 1 ? "Approve this exchange request?" : "Reject this exchange request?"}
        description={
          pendingAction === 1
            ? "This restocks the returned item and reserves the replacement variant. The customer will be emailed."
            : "The customer will be emailed that their request was rejected."
        }
        confirmLabel={pendingAction === 1 ? "Yes, approve" : "Yes, reject"}
        variant={pendingAction === 2 ? "destructive" : "default"}
        onConfirm={() => {
          if (pendingAction !== null) return applyStatus(pendingAction);
        }}
      />
    </div>
  );
}
