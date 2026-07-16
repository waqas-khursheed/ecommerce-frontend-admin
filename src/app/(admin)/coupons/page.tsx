"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { couponService } from "@/services/coupon.service";
import { categoryService } from "@/services/category.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { couponSchema } from "@/lib/validations/coupon.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { Coupon, CouponUsage } from "@/types/coupon";
import type { Category } from "@/types/category";

export default function CouponsPage() {
  const { items: rows, isLoading, reload: loadCoupons, pagination } = usePaginatedList(
    (params) => couponService.list(params),
    { pageSize: 10, errorMessage: "Failed to load coupons" }
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [open, setOpen] = useState(false);
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [usagesFor, setUsagesFor] = useState<Coupon | null>(null);
  const [usages, setUsages] = useState<CouponUsage[]>([]);
  const [usagesOpen, setUsagesOpen] = useState(false);
  const [isLoadingUsages, setIsLoadingUsages] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    (async () => {
      try {
        const { items } = await categoryService.list({ limit: 100 });
        setCategories(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load categories"));
      }
    })();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setApplyToAll(true);
    setSelectedCategoryIds([]);
    setErrors({});
    setOpen(true);
  };

  const openEdit = async (coupon: Coupon) => {
    setEditing(coupon);
    setApplyToAll(coupon.to_all !== 0);
    setSelectedCategoryIds((coupon.metaCouponCategories ?? []).map((m) => m.cat_id));
    setErrors({});
    setOpen(true);

    // The list endpoint doesn't include metaCouponCategories (only getById
    // does) — refetch so the category checkboxes reflect what's actually saved.
    try {
      const full = await couponService.getById(coupon.id);
      setEditing(full);
      setApplyToAll(full.to_all !== 0);
      setSelectedCategoryIds((full.metaCouponCategories ?? []).map((m) => m.cat_id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load coupon details"));
    }
  };

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const openUsages = async (coupon: Coupon) => {
    setUsagesFor(coupon);
    setUsagesOpen(true);
    setUsages([]);
    setIsLoadingUsages(true);
    try {
      const { items } = await couponService.getUsages(coupon.id, { limit: 100 });
      setUsages(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load usage history"));
    } finally {
      setIsLoadingUsages(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const expiresAt = String(formData.get("expires_at") ?? "");
    const usageLimit = String(formData.get("usage_limit") ?? "");
    const minOrderAmount = String(formData.get("min_order_amount") ?? "");

    const { data, errors: validationErrors } = validateForm(couponSchema, {
      code: String(formData.get("code") ?? ""),
      percentage: String(formData.get("percentage") ?? ""),
      status: String(formData.get("status") ?? "1"),
      usage_limit: usageLimit || null,
      min_order_amount: minOrderAmount || null,
      expires_at: expiresAt || null,
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const payload = {
      code: String(formData.get("code") ?? ""),
      percentage: Number(formData.get("percentage") ?? 0),
      status: Number(formData.get("status") ?? 1) as 0 | 1,
      expires_at: expiresAt || null,
      usage_limit: usageLimit ? Number(usageLimit) : null,
      min_order_amount: minOrderAmount ? Number(minOrderAmount) : null,
      to_all: (applyToAll ? 1 : 0) as 0 | 1,
      category_ids: applyToAll ? [] : selectedCategoryIds,
    };

    try {
      if (editing) {
        await couponService.update(editing.id, payload);
        toast.success(`"${payload.code}" updated`);
      } else {
        await couponService.create(payload);
        toast.success(`"${payload.code}" created`);
      }
      setOpen(false);
      setEditing(null);
      await loadCoupons();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save coupon"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await couponService.remove(deletingId);
      toast.success("Coupon deleted");
      await loadCoupons();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete coupon"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Coupon, unknown>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "percentage",
        header: "Discount",
        cell: ({ getValue }) => `${getValue()}%`,
      },
      {
        id: "categories",
        header: "Applies to",
        cell: ({ row }) => (row.original.to_all ? "All categories" : "Selected categories"),
      },
      {
        id: "usage",
        header: "Usage",
        cell: ({ row }) =>
          row.original.usage_limit ? (
            <div className="w-32 space-y-1">
              <Progress value={(row.original.used_count / row.original.usage_limit) * 100} className="h-1.5" />
              <span className="text-xs text-muted-foreground">
                {row.original.used_count} / {row.original.usage_limit}
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">{row.original.used_count} / unlimited</span>
          ),
      },
      {
        accessorKey: "expires_at",
        header: "Expiry",
        cell: ({ getValue }) => (getValue() ? new Date(getValue() as string).toLocaleDateString() : "No expiry"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() === 1 ? "Active" : "Inactive"} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onView={() => openUsages(row.original)}
              onEdit={() => openEdit(row.original)}
              onDelete={() => setDeletingId(row.original.id)}
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
        title="Coupons"
        description="Create and manage discount coupons."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Coupons" }]}
        actions={
          <Sheet
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <SheetTrigger render={<Button onClick={openCreate}><Plus />Add Coupon</Button>} />
            <SheetContent className="overflow-y-auto">
              <form action={handleSubmit} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Coupon" : "Add Coupon"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update coupon details." : "Create a new discount coupon code."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="SUMMER25"
                      defaultValue={editing?.code}
                      aria-invalid={!!errors.code}
                      onChange={() => errors.code && setErrors((prev) => ({ ...prev, code: "" }))}
                    />
                    <FieldError message={errors.code} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="percentage">Discount %</Label>
                      <Input
                        id="percentage"
                        name="percentage"
                        type="number"
                        step="0.01"
                        max={100}
                        defaultValue={editing?.percentage}
                        aria-invalid={!!errors.percentage}
                        onChange={() => errors.percentage && setErrors((prev) => ({ ...prev, percentage: "" }))}
                      />
                      <FieldError message={errors.percentage} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={String(editing?.status ?? 1)}>
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="usage_limit">Usage limit</Label>
                      <Input
                        id="usage_limit"
                        name="usage_limit"
                        type="number"
                        placeholder="Unlimited"
                        defaultValue={editing?.usage_limit ?? ""}
                        aria-invalid={!!errors.usage_limit}
                        onChange={() => errors.usage_limit && setErrors((prev) => ({ ...prev, usage_limit: "" }))}
                      />
                      <FieldError message={errors.usage_limit} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="min_order_amount">Min. order amount</Label>
                      <Input
                        id="min_order_amount"
                        name="min_order_amount"
                        type="number"
                        step="0.01"
                        defaultValue={editing?.min_order_amount ?? ""}
                        aria-invalid={!!errors.min_order_amount}
                        onChange={() =>
                          errors.min_order_amount && setErrors((prev) => ({ ...prev, min_order_amount: "" }))
                        }
                      />
                      <FieldError message={errors.min_order_amount} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expires_at">Expiry date</Label>
                    <Input
                      id="expires_at"
                      name="expires_at"
                      type="date"
                      defaultValue={editing?.expires_at ? editing.expires_at.slice(0, 10) : ""}
                      aria-invalid={!!errors.expires_at}
                      onChange={() => errors.expires_at && setErrors((prev) => ({ ...prev, expires_at: "" }))}
                    />
                    <FieldError message={errors.expires_at} />
                  </div>

                  <div className="space-y-2 rounded-md border p-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Checkbox checked={applyToAll} onCheckedChange={(v) => setApplyToAll(!!v)} />
                      Applies to all categories
                    </label>
                    {!applyToAll && (
                      <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto pt-1">
                        {categories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={selectedCategoryIds.includes(cat.id)}
                              onCheckedChange={() => toggleCategory(cat.id)}
                            />
                            {cat.title}
                          </label>
                        ))}
                        {categories.length === 0 && (
                          <p className="col-span-2 text-xs text-muted-foreground">No categories yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create coupon"}
                  </Button>
                  <SheetClose render={<Button variant="outline">Cancel</Button>} />
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search coupons..."
        searchColumn="code"
        pagination={pagination}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this coupon?"
        onConfirm={handleDelete}
      />

      <Sheet open={usagesOpen} onOpenChange={(v) => { setUsagesOpen(v); if (!v) setUsagesFor(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Usage history — {usagesFor?.code}</SheetTitle>
            <SheetDescription>Every customer who has redeemed this coupon.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-2 px-4">
            {isLoadingUsages ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : usages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not redeemed by any customer yet.</p>
            ) : (
              usages.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <p className="font-medium">
                      {u.user ? `${u.user.first_name} ${u.user.last_name}` : `User #${u.user_id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.user?.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
          <SheetFooter>
            <SheetClose render={<Button variant="outline">Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
