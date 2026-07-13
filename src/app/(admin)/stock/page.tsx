"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { stock as initialStock, type StockRow } from "@/lib/mock/catalog";

export default function StockPage() {
  const [rows, setRows] = useState<StockRow[]>(initialStock);
  const [editing, setEditing] = useState<StockRow | null>(null);
  const [open, setOpen] = useState(false);

  const columns = useMemo<ColumnDef<StockRow, unknown>[]>(
    () => [
      { accessorKey: "product", header: "Product" },
      { accessorKey: "sku", header: "SKU" },
      { accessorKey: "warehouse", header: "Warehouse" },
      { accessorKey: "quantity", header: "Quantity" },
      { accessorKey: "reserved", header: "Reserved" },
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
            />
          </div>
        ),
      },
    ],
    []
  );

  const handleSubmit = (formData: FormData) => {
    if (!editing) return;
    const quantity = Number(formData.get("quantity") ?? 0);
    const reserved = Number(formData.get("reserved") ?? 0);
    const status: StockRow["status"] = quantity === 0 ? "Out_of_stock" : quantity < 10 ? "Low" : "In_stock";

    setRows((prev) =>
      prev.map((r) => (r.id === editing.id ? { ...r, quantity, reserved, status } : r))
    );
    toast.success(`Stock for "${editing.product}" updated`);
    setOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stock"
        description="Monitor and adjust inventory levels across warehouses."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stock" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Search stock..."
        searchColumn="product"
        filterColumn="status"
        filterTabs={[
          { label: "All", value: "all" },
          { label: "In stock", value: "In_stock" },
          { label: "Low", value: "Low" },
          { label: "Out of stock", value: "Out_of_stock" },
        ]}
      />

      <Sheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditing(null);
        }}
      >
        <SheetContent>
          <form action={(formData) => handleSubmit(formData)} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Adjust Stock</SheetTitle>
              <SheetDescription>{editing?.product}</SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 px-4">
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" defaultValue={editing?.quantity} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reserved">Reserved</Label>
                <Input id="reserved" name="reserved" type="number" defaultValue={editing?.reserved} required />
              </div>
            </div>
            <SheetFooter>
              <Button type="submit">Save changes</Button>
              <SheetClose render={<Button variant="outline">Cancel</Button>} />
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
