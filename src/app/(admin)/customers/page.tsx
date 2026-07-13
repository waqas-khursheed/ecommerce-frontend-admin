"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { AvatarCell } from "@/components/data-table/avatar-cell";
import { RowActions } from "@/components/data-table/row-actions";
import { Switch } from "@/components/ui/switch";
import { customers as initialCustomers, type CustomerRow } from "@/lib/mock/sales";

export default function CustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>(initialCustomers);

  const toggleStatus = (id: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r
      )
    );
  };

  const columns = useMemo<ColumnDef<CustomerRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Customer",
        cell: ({ row }) => <AvatarCell name={row.original.name} subtitle={row.original.email} />,
      },
      { accessorKey: "location", header: "Location" },
      { accessorKey: "orders", header: "Orders" },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
      },
      { accessorKey: "joined", header: "Joined" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.status} />
            <Switch
              checked={row.original.status === "Active"}
              onCheckedChange={() => toggleStatus(row.original.id)}
              aria-label="Toggle customer status"
            />
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onView={() => toast.info(`Viewing ${row.original.name} (UI only)`)}
              onDelete={() => {
                setRows((prev) => prev.filter((r) => r.id !== row.original.id));
                toast.success(`${row.original.name} removed`);
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
        title="Customers"
        description="View and manage registered storefront customers."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search customers..."
        searchColumn="name"
        filterColumn="status"
        filterTabs={[
          { label: "All", value: "all" },
          { label: "Active", value: "Active" },
          { label: "Pending", value: "Pending" },
          { label: "Inactive", value: "Inactive" },
        ]}
      />
    </div>
  );
}
