"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { rewardSettingSchema, rewardsEarningMethodSchema } from "@/lib/validations/reward.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { rewardSettingService, rewardsEarningMethodService, userRewardService } from "@/services/reward.service";
import type { RewardSetting, RewardsEarningMethod, UserReward } from "@/types/reward";

function RewardSettingsTab() {
  const { items: rows, isLoading, reload: load, pagination } = usePaginatedList(
    (params) => rewardSettingService.list(params),
    { pageSize: 10, errorMessage: "Failed to load reward settings" }
  );
  const [editing, setEditing] = useState<RewardSetting | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (formData: FormData) => {
    const { data: payload, errors: validationErrors } = validateForm(rewardSettingSchema, {
      minimum_points: String(formData.get("minimum_points") ?? "0"),
      points: String(formData.get("points") ?? "0"),
      equal_to: String(formData.get("equal_to") ?? "0"),
    });
    if (!payload) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      if (editing) {
        await rewardSettingService.update(editing.id, payload);
        toast.success("Reward setting updated");
      } else {
        await rewardSettingService.create(payload);
        toast.success("Reward setting created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save reward setting"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await rewardSettingService.remove(deletingId);
      toast.success("Reward setting deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete reward setting"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<RewardSetting, unknown>[]>(
    () => [
      { accessorKey: "minimum_points", header: "Minimum Points" },
      { accessorKey: "points", header: "Points" },
      { accessorKey: "equal_to", header: "Equal To ($)" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                setEditing(row.original);
                setErrors({});
                setOpen(true);
              }}
              onDelete={() => setDeletingId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <SheetTrigger render={<Button onClick={() => { setEditing(null); setErrors({}); }}><Plus />Add Setting</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Reward Setting" : "Add Reward Setting"}</SheetTitle>
                <SheetDescription>Define how points map to redemption value.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="minimum_points">Minimum points required</Label>
                  <Input
                    id="minimum_points"
                    name="minimum_points"
                    type="number"
                    defaultValue={editing?.minimum_points}
                    aria-invalid={!!errors.minimum_points}
                    onChange={() => errors.minimum_points && setErrors((prev) => ({ ...prev, minimum_points: "" }))}
                  />
                  <FieldError message={errors.minimum_points} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    name="points"
                    type="number"
                    defaultValue={editing?.points}
                    aria-invalid={!!errors.points}
                    onChange={() => errors.points && setErrors((prev) => ({ ...prev, points: "" }))}
                  />
                  <FieldError message={errors.points} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="equal_to">Equal to ($)</Label>
                  <Input
                    id="equal_to"
                    name="equal_to"
                    type="number"
                    defaultValue={editing?.equal_to}
                    aria-invalid={!!errors.equal_to}
                    onChange={() => errors.equal_to && setErrors((prev) => ({ ...prev, equal_to: "" }))}
                  />
                  <FieldError message={errors.equal_to} />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
                <SheetClose render={<Button variant="outline">Cancel</Button>} />
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search settings..." pagination={pagination} />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this setting?" onConfirm={handleDelete} />
    </div>
  );
}

function EarningMethodsTab() {
  const { items: rows, isLoading, reload: load, pagination } = usePaginatedList(
    (params) => rewardsEarningMethodService.list(params),
    { pageSize: 10, errorMessage: "Failed to load earning methods" }
  );
  const [editing, setEditing] = useState<RewardsEarningMethod | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (formData: FormData) => {
    const { data: payload, errors: validationErrors } = validateForm(rewardsEarningMethodSchema, {
      purchase: String(formData.get("purchase") ?? "0"),
      equals_to: String(formData.get("equals_to") ?? "0"),
    });
    if (!payload) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      if (editing) {
        await rewardsEarningMethodService.update(editing.id, payload);
        toast.success("Earning method updated");
      } else {
        await rewardsEarningMethodService.create(payload);
        toast.success("Earning method created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save earning method"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await rewardsEarningMethodService.remove(deletingId);
      toast.success("Earning method deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete earning method"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<RewardsEarningMethod, unknown>[]>(
    () => [
      { accessorKey: "purchase", header: "Purchase Amount ($)" },
      { accessorKey: "equals_to", header: "Equals To (points)" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                setEditing(row.original);
                setErrors({});
                setOpen(true);
              }}
              onDelete={() => setDeletingId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <SheetTrigger render={<Button onClick={() => { setEditing(null); setErrors({}); }}><Plus />Add Method</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Earning Method" : "Add Earning Method"}</SheetTitle>
                <SheetDescription>Define how purchases translate into points.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="purchase">Purchase amount ($)</Label>
                  <Input
                    id="purchase"
                    name="purchase"
                    type="number"
                    defaultValue={editing?.purchase}
                    aria-invalid={!!errors.purchase}
                    onChange={() => errors.purchase && setErrors((prev) => ({ ...prev, purchase: "" }))}
                  />
                  <FieldError message={errors.purchase} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="equals_to">Equals to (points)</Label>
                  <Input
                    id="equals_to"
                    name="equals_to"
                    type="number"
                    defaultValue={editing?.equals_to}
                    aria-invalid={!!errors.equals_to}
                    onChange={() => errors.equals_to && setErrors((prev) => ({ ...prev, equals_to: "" }))}
                  />
                  <FieldError message={errors.equals_to} />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
                <SheetClose render={<Button variant="outline">Cancel</Button>} />
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search methods..." pagination={pagination} />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this method?" onConfirm={handleDelete} />
    </div>
  );
}

function UserRewardsTab() {
  const {
    items: rows,
    isLoading,
    pagination,
    search,
    setSearch,
  } = usePaginatedList((params) => userRewardService.list(params), {
    pageSize: 10,
    errorMessage: "Failed to load user rewards",
  });

  const columns = useMemo<ColumnDef<UserReward, unknown>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        accessorFn: (row) => (row.user ? `${row.user.first_name} ${row.user.last_name}` : `User #${row.user_id}`),
      },
      { id: "email", header: "Email", accessorFn: (row) => row.user?.email ?? "—" },
      { accessorKey: "rewards", header: "Points" },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      searchPlaceholder="Search customers..."
      searchColumn="customer"
      serverSearch={{ value: search, onChange: setSearch }}
      pagination={pagination}
    />
  );
}

export default function RewardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rewards"
        description="Configure the loyalty and rewards program."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rewards" }]}
      />

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="methods">Earning Methods</TabsTrigger>
          <TabsTrigger value="users">User Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <RewardSettingsTab />
        </TabsContent>
        <TabsContent value="methods" className="mt-4">
          <EarningMethodsTab />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UserRewardsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
