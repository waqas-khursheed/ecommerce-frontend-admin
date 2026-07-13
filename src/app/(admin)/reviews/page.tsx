"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Star, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Button } from "@/components/ui/button";
import { reviews as initialReviews, type ReviewRow } from "@/lib/mock/sales";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>(initialReviews);

  const setStatus = (id: number, status: ReviewRow["status"]) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Review ${status.toLowerCase()}`);
  };

  const columns = useMemo<ColumnDef<ReviewRow, unknown>[]>(
    () => [
      { accessorKey: "customer", header: "Customer" },
      { accessorKey: "product", header: "Product" },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ getValue }) => <StarRating rating={getValue() as number} />,
      },
      {
        accessorKey: "comment",
        header: "Comment",
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-xs text-muted-foreground">{getValue() as string}</span>
        ),
      },
      { accessorKey: "date", header: "Date" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            {row.original.status !== "Approved" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-emerald-600 hover:text-emerald-600"
                onClick={() => setStatus(row.original.id, "Approved")}
              >
                <Check className="size-4" />
              </Button>
            )}
            {row.original.status !== "Rejected" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-red-600 hover:text-red-600"
                onClick={() => setStatus(row.original.id, "Rejected")}
              >
                <X className="size-4" />
              </Button>
            )}
            <RowActions
              onDelete={() => {
                setRows((prev) => prev.filter((r) => r.id !== row.original.id));
                toast.success("Review deleted");
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
        title="Reviews"
        description="Moderate product reviews submitted by customers."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reviews" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search reviews..."
        searchColumn="product"
        filterColumn="status"
        filterTabs={[
          { label: "All", value: "all" },
          { label: "Approved", value: "Approved" },
          { label: "Pending", value: "Pending" },
          { label: "Rejected", value: "Rejected" },
        ]}
      />
    </div>
  );
}
