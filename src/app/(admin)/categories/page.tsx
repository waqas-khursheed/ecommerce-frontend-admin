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
import { categories as initialCategories, type CategoryRow } from "@/lib/mock/catalog";

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>(initialCategories);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [open, setOpen] = useState(false);

  const columns = useMemo<ColumnDef<CategoryRow, unknown>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        ),
      },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "parent",
        header: "Parent",
        cell: ({ getValue }) => (getValue() as string | null) ?? "—",
      },
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
    const slug = String(formData.get("slug") ?? "");
    const status = String(formData.get("status") ?? "Active") as CategoryRow["status"];

    if (editing) {
      setRows((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, name, slug, status } : r))
      );
      toast.success(`"${name}" updated`);
    } else {
      setRows((prev) => [
        { id: Math.max(0, ...prev.map((r) => r.id)) + 1, name, slug, parent: null, products: 0, status },
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
        title="Categories"
        description="Organize your products into categories."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Categories" }]}
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
                  Add Category
                </Button>
              }
            />
            <SheetContent>
              <form
                action={(formData) => handleSubmit(formData)}
                className="flex h-full flex-col"
              >
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Category" : "Add Category"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update category details." : "Create a new product category."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editing?.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" defaultValue={editing?.slug} required />
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
                  <Button type="submit">{editing ? "Save changes" : "Create category"}</Button>
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
        searchPlaceholder="Search categories..."
        searchColumn="name"
      />
    </div>
  );
}
