"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { AvatarCell } from "@/components/data-table/avatar-cell";
import { Button } from "@/components/ui/button";
import { orders as initialOrders, type OrderRow } from "@/lib/mock/sales";

// recharts measures the DOM to render, so this is loaded client-only to avoid SSR.
const MiniTrend = dynamic(() => import("@/components/data-table/mini-trend").then((m) => m.MiniTrend), {
  ssr: false,
});

export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>(initialOrders);

  const columns = useMemo<ColumnDef<OrderRow, unknown>[]>(
    () => [
      { accessorKey: "id", header: "Order" },
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => <AvatarCell name={row.original.customer} subtitle={row.original.email} />,
      },
      { accessorKey: "product", header: "Product" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: "date", header: "Date" },
      {
        accessorKey: "trend",
        header: "Trend",
        enableSorting: false,
        cell: ({ getValue }) => <MiniTrend direction={getValue() as "up" | "down"} />,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="font-semibold">${(getValue() as number).toFixed(2)}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onView={() => toast.info(`Viewing ${row.original.id} (UI only)`)}
              onDelete={() => {
                setRows((prev) => prev.filter((r) => r.id !== row.original.id));
                toast.success(`${row.original.id} deleted`);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Manage and track all customer orders."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Orders" }]}
        actions={
          <Button onClick={() => toast.info("UI only, not wired up yet")}>
            <Plus />
            New Order
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search orders..."
        searchColumn="customer"
        filterColumn="status"
        filterTabs={[
          { label: "All", value: "all" },
          { label: "Completed", value: "Completed" },
          { label: "Processing", value: "Processing" },
          { label: "Pending", value: "Pending" },
          { label: "Cancelled", value: "Cancelled" },
        ]}
        toolbarActions={
          <>
            <Button variant="outline" size="sm" onClick={() => toast.info("UI only, not wired up yet")}>
              <SlidersHorizontal />
              Columns
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("UI only, not wired up yet")}>
              <Download />
              Export
            </Button>
          </>
        }
      />
    </div>
  );
}
