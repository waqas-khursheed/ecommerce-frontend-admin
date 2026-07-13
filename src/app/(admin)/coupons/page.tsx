"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { coupons as initialCoupons, type CouponRow } from "@/lib/mock/marketing";

export default function CouponsPage() {
  const [rows, setRows] = useState<CouponRow[]>(initialCoupons);
  const [open, setOpen] = useState(false);

  const columns = useMemo<ColumnDef<CouponRow, unknown>[]>(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "type", header: "Type" },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) =>
          row.original.type === "Percentage" ? `${row.original.value}%` : `$${row.original.value}`,
      },
      {
        id: "usage",
        header: "Usage",
        cell: ({ row }) => (
          <div className="w-32 space-y-1">
            <Progress value={(row.original.used / row.original.limit) * 100} className="h-1.5" />
            <span className="text-xs text-muted-foreground">
              {row.original.used} / {row.original.limit}
            </span>
          </div>
        ),
      },
      { accessorKey: "expiry", header: "Expiry" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => toast.info(`Edit "${row.original.code}" (UI only)`)}
              onDelete={() => {
                setRows((prev) => prev.filter((r) => r.id !== row.original.id));
                toast.success(`"${row.original.code}" deleted`);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  const handleSubmit = (formData: FormData) => {
    const code = String(formData.get("code") ?? "").toUpperCase();
    const type = String(formData.get("type") ?? "Percentage") as CouponRow["type"];
    const value = Number(formData.get("value") ?? 0);
    const expiry = String(formData.get("expiry") ?? "");

    setRows((prev) => [
      { id: Math.max(0, ...prev.map((r) => r.id)) + 1, code, type, value, used: 0, limit: 500, expiry, status: "Active" },
      ...prev,
    ]);
    toast.success(`Coupon "${code}" created`);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Coupons"
        description="Create and manage discount coupons."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Coupons" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button>
                  <Plus />
                  Add Coupon
                </Button>
              }
            />
            <SheetContent>
              <form action={(formData) => handleSubmit(formData)} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>Add Coupon</SheetTitle>
                  <SheetDescription>Create a new discount coupon code.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" name="code" placeholder="SUMMER25" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="type">Type</Label>
                      <Select name="type" defaultValue="Percentage">
                        <SelectTrigger id="type" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="Fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="value">Value</Label>
                      <Input id="value" name="value" type="number" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry">Expiry date</Label>
                    <Input id="expiry" name="expiry" placeholder="Mar 31, 2026" required />
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit">Create coupon</Button>
                  <SheetClose render={<Button variant="outline">Cancel</Button>} />
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        }
      />

      <DataTable columns={columns} data={rows} searchPlaceholder="Search coupons..." searchColumn="code" />
    </div>
  );
}
