"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Star, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { reviewService } from "@/services/review.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { REVIEW_STATUS_LABELS, type Review } from "@/types/review";

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
  const { items: rows, setItems: setRows, isLoading, reload: loadReviews, pagination } = usePaginatedList(
    (params) => reviewService.list(params),
    { pageSize: 10, errorMessage: "Failed to load reviews" }
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const setStatus = async (id: number, status: 0 | 1 | 2) => {
    try {
      await reviewService.updateStatus(id, status);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Review ${REVIEW_STATUS_LABELS[status].toLowerCase()}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update review status"));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await reviewService.remove(deletingId);
      toast.success("Review deleted");
      await loadReviews();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete review"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Review, unknown>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        accessorFn: (row) => row.user ? `${row.user.first_name} ${row.user.last_name}` : row.name,
      },
      { id: "product", header: "Product", accessorFn: (row) => row.product?.title ?? `#${row.product_id}` },
      {
        accessorKey: "rate",
        header: "Rating",
        cell: ({ getValue }) => <StarRating rating={getValue() as number} />,
      },
      {
        accessorKey: "review",
        header: "Comment",
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-xs text-muted-foreground">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={REVIEW_STATUS_LABELS[getValue() as number]} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            {row.original.status !== 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-emerald-600 hover:text-emerald-600"
                aria-label="Approve review"
                onClick={() => setStatus(row.original.id, 1)}
              >
                <Check className="size-4" />
              </Button>
            )}
            {row.original.status !== 2 && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-red-600 hover:text-red-600"
                aria-label="Reject review"
                onClick={() => setStatus(row.original.id, 2)}
              >
                <X className="size-4" />
              </Button>
            )}
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
        title="Reviews"
        description="Moderate product reviews submitted by customers."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reviews" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search reviews..."
        searchColumn="product"
        pagination={pagination}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this review?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
