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
import { exchangeService } from "@/services/exchange.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { Exchange } from "@/types/exchange";

export default function ExchangesPage() {
  const { items: rows, setItems: setRows, isLoading, reload: loadExchanges, pagination } = usePaginatedList(
    (params) => exchangeService.list(params),
    { pageSize: 10, errorMessage: "Failed to load exchange requests" }
  );
  const [viewing, setViewing] = useState<Exchange | null>(null);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openExchange = async (row: Exchange) => {
    setViewing(row);
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
        accessorKey: "seen",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() ? "Reviewed" : "Pending"} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => openExchange(row.original)}>
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
            <div className="flex-1 space-y-4 px-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Email: {viewing.email ?? "—"}</p>
                <p className="text-muted-foreground">Phone: {viewing.phone_number ?? "—"}</p>
                {viewing.order && (
                  <p className="text-muted-foreground">Order total: ${Number(viewing.order.grand_total).toFixed(2)}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-1">
                <p className="font-medium">Returning</p>
                <p className="text-muted-foreground">{viewing.return_item_name ?? "—"}</p>
                {viewing.return_item_size && (
                  <p className="text-muted-foreground">Size: {viewing.return_item_size}</p>
                )}
                {viewing.return_item_code && (
                  <p className="text-muted-foreground">Code: {viewing.return_item_code}</p>
                )}
              </div>

              {(viewing.required_item_name || viewing.required_item_code) && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="font-medium">Requested in exchange</p>
                    <p className="text-muted-foreground">{viewing.required_item_name ?? "—"}</p>
                    {viewing.required_item_size && (
                      <p className="text-muted-foreground">Size: {viewing.required_item_size}</p>
                    )}
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
            </div>
          )}
          <SheetFooter>
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
    </div>
  );
}
