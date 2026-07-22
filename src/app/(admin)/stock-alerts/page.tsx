"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { stockAlertService } from "@/services/stockAlert.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { StockAlert } from "@/types/stockAlert";

function variantLabel(stock: StockAlert["stock"]) {
  if (!stock) return "—";
  return [stock.color?.title, stock.size?.title, stock.fitting?.title].filter(Boolean).join(" / ") || "—";
}

export default function StockAlertsPage() {
  const {
    items: rows,
    isLoading,
    reload: loadStockAlerts,
    pagination,
    search,
    setSearch,
  } = usePaginatedList((params) => stockAlertService.list(params), {
    pageSize: 10,
    errorMessage: "Failed to load stock alerts",
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await stockAlertService.remove(deletingId);
      toast.success("Stock alert deleted");
      await loadStockAlerts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete stock alert"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<StockAlert, unknown>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        accessorFn: (row) => row.product?.title ?? `#${row.product_id}`,
      },
      {
        id: "variant",
        header: "Variant",
        cell: ({ row }) => variantLabel(row.original.stock),
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "created_at",
        header: "Requested",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "notified_at",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() ? "Notified" : "Pending"} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
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
        title="Stock Alerts"
        description="Customers waiting to be emailed when an out-of-stock product or variant is back."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stock Alerts" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search by email..."
        searchColumn="email"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this stock alert?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
