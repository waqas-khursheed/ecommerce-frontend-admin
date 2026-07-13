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
import { brands as initialBrands, type BrandRow } from "@/lib/mock/catalog";

export default function BrandsPage() {
  const [rows, setRows] = useState<BrandRow[]>(initialBrands);
  const [editing, setEditing] = useState<BrandRow | null>(null);
  const [open, setOpen] = useState(false);

  const columns = useMemo<ColumnDef<BrandRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "products", header: "Products" },
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
              onEdit={() => {
                setEditing(row.original);
                setOpen(true);
              }}
              onDelete={() => {
                setRows((prev) => prev.filter((r) => r.id !== row.original.id));
                toast.success(`"${row.original.name}" deleted`);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  const handleSubmit = (formData: FormData) => {
    const name = String(formData.get("name") ?? "");
    const status = String(formData.get("status") ?? "Active") as BrandRow["status"];

    if (editing) {
      setRows((prev) => prev.map((r) => (r.id === editing.id ? { ...r, name, status } : r)));
      toast.success(`"${name}" updated`);
    } else {
      setRows((prev) => [
        { id: Math.max(0, ...prev.map((r) => r.id)) + 1, name, products: 0, status },
        ...prev,
      ]);
      toast.success(`"${name}" added`);
    }
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Brands"
        description="Manage the brands available across your catalog."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Brands" }]}
        actions={
          <Sheet
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <SheetTrigger
              render={
                <Button onClick={() => setEditing(null)}>
                  <Plus />
                  Add Brand
                </Button>
              }
            />
            <SheetContent>
              <form action={(formData) => handleSubmit(formData)} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Brand" : "Add Brand"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update brand details." : "Create a new brand."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editing?.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editing?.status ?? "Active"}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit">{editing ? "Save changes" : "Create brand"}</Button>
                  <SheetClose render={<Button variant="outline">Cancel</Button>} />
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        }
      />

      <DataTable columns={columns} data={rows} searchPlaceholder="Search brands..." searchColumn="name" />
    </div>
  );
}
