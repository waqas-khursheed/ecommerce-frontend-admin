"use client";

import { useEffect, useMemo, useState } from "react";
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
import { rewardSettingService, rewardsEarningMethodService, userRewardService } from "@/services/reward.service";
import type { RewardSetting, RewardsEarningMethod, UserReward } from "@/types/reward";

function RewardSettingsTab() {
  const [rows, setRows] = useState<RewardSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<RewardSetting | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await rewardSettingService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load reward settings"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await rewardSettingService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load reward settings"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      minimum_points: Number(formData.get("minimum_points") ?? 0),
      points: Number(formData.get("points") ?? 0),
      equal_to: Number(formData.get("equal_to") ?? 0),
    };
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
          <SheetTrigger render={<Button onClick={() => setEditing(null)}><Plus />Add Setting</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Reward Setting" : "Add Reward Setting"}</SheetTitle>
                <SheetDescription>Define how points map to redemption value.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="minimum_points">Minimum points required</Label>
                  <Input id="minimum_points" name="minimum_points" type="number" defaultValue={editing?.minimum_points} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="points">Points</Label>
                  <Input id="points" name="points" type="number" defaultValue={editing?.points} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="equal_to">Equal to ($)</Label>
                  <Input id="equal_to" name="equal_to" type="number" defaultValue={editing?.equal_to} required />
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search settings..." />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this setting?" onConfirm={handleDelete} />
    </div>
  );
}

function EarningMethodsTab() {
  const [rows, setRows] = useState<RewardsEarningMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<RewardsEarningMethod | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await rewardsEarningMethodService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load earning methods"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await rewardsEarningMethodService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load earning methods"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      purchase: Number(formData.get("purchase") ?? 0),
      equals_to: Number(formData.get("equals_to") ?? 0),
    };
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
          <SheetTrigger render={<Button onClick={() => setEditing(null)}><Plus />Add Method</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Earning Method" : "Add Earning Method"}</SheetTitle>
                <SheetDescription>Define how purchases translate into points.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="purchase">Purchase amount ($)</Label>
                  <Input id="purchase" name="purchase" type="number" defaultValue={editing?.purchase} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="equals_to">Equals to (points)</Label>
                  <Input id="equals_to" name="equals_to" type="number" defaultValue={editing?.equals_to} required />
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search methods..." />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this method?" onConfirm={handleDelete} />
    </div>
  );
}

function UserRewardsTab() {
  const [rows, setRows] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await userRewardService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load user rewards"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
