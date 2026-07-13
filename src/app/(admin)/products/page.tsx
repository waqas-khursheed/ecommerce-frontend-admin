"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Star } from "lucide-react";
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
import { brands, categories, products as initialProducts, type ProductRow } from "@/lib/mock/catalog";

function ProductThumb({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
      {initial}
    </div>
  );
}

export default function ProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>(initialProducts);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [open, setOpen] = useState(false);

  const columns = useMemo<ColumnDef<ProductRow, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <ProductThumb name={row.original.name} />
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.sku}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "brand", header: "Brand" },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
      },
      { accessorKey: "stock", header: "Stock" },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            {(getValue() as number).toFixed(1)}
          </span>
        ),
      },
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
              onView={() => toast.info(`Viewing "${row.original.name}" (UI only)`)}
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
    const sku = String(formData.get("sku") ?? "");
    const category = String(formData.get("category") ?? categories[0]?.name);
    const brand = String(formData.get("brand") ?? brands[0]?.name);
    const price = Number(formData.get("price") ?? 0);
    const stock = Number(formData.get("stock") ?? 0);
    const status = String(formData.get("status") ?? "Active") as ProductRow["status"];

    if (editing) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editing.id ? { ...r, name, sku, category, brand, price, stock, status } : r
        )
      );
      toast.success(`"${name}" updated`);
    } else {
      setRows((prev) => [
        {
          id: Math.max(0, ...prev.map((r) => r.id)) + 1,
          name,
          sku,
          category,
          brand,
          price,
          stock,
          status,
          rating: 0,
        },
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
        title="Products"
        description="Manage your product catalog."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Products" }]}
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
                  Add Product
                </Button>
              }
            />
            <SheetContent className="sm:max-w-md">
              <form action={(formData) => handleSubmit(formData)} className="flex h-full flex-col overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Product" : "Add Product"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update product details." : "Add a new product to your catalog."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editing?.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" name="sku" defaultValue={editing?.sku} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="category">Category</Label>
                      <Select name="category" defaultValue={editing?.category ?? categories[0]?.name}>
                        <SelectTrigger id="category" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="brand">Brand</Label>
                      <Select name="brand" defaultValue={editing?.brand ?? brands[0]?.name}>
                        <SelectTrigger id="brand" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.id} value={b.name}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="price">Price</Label>
                      <Input id="price" name="price" type="number" step="0.01" defaultValue={editing?.price} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stock">Stock</Label>
                      <Input id="stock" name="stock" type="number" defaultValue={editing?.stock} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editing?.status ?? "Active"}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Out_of_stock">Out of stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit">{editing ? "Save changes" : "Create product"}</Button>
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
        searchPlaceholder="Search products..."
        searchColumn="name"
        filterColumn="status"
        filterTabs={[
          { label: "All", value: "all" },
          { label: "Active", value: "Active" },
          { label: "Draft", value: "Draft" },
          { label: "Out of stock", value: "Out_of_stock" },
        ]}
      />
    </div>
  );
}
