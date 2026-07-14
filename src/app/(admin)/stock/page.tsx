"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { stockService } from "@/services/stock.service";
import { productService } from "@/services/product.service";
import { attributeService, attributeItemService } from "@/services/attribute.service";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Stock } from "@/types/stock";
import type { Product } from "@/types/product";
import type { Attribute, AttributeItem } from "@/types/attribute";

function stockStatus(qty: number | null) {
  if (qty === null) return "In stock";
  if (qty === 0) return "Out of stock";
  if (qty < 10) return "Low";
  return "In stock";
}

// There's no dedicated "attribute type" flag on the backend — Color/Size/
// Fitting are just ProductAttribute rows distinguished only by their title —
// so the Color/Size/Fitting selects on this page match by title (accepting
// the British "Colour" spelling too). If nobody has created a "Color" or
// "Fitting" attribute yet under Attributes, that dropdown is legitimately
// empty until one is; see the empty-state hint rendered next to each select.
async function loadAttributeGroups(attributes: Attribute[]) {
  const findByTitle = (needles: string[]) =>
    attributes.find((a) => needles.some((n) => a.attribute_title.toLowerCase().includes(n)));

  const colorAttr = findByTitle(["color", "colour"]);
  const sizeAttr = findByTitle(["size"]);
  const fittingAttr = findByTitle(["fit"]);

  const [colorRes, sizeRes, fittingRes] = await Promise.all([
    colorAttr ? attributeItemService.list({ limit: 100, attribute_id: colorAttr.id }) : null,
    sizeAttr ? attributeItemService.list({ limit: 100, attribute_id: sizeAttr.id }) : null,
    fittingAttr ? attributeItemService.list({ limit: 100, attribute_id: fittingAttr.id }) : null,
  ]);

  return {
    colors: colorRes?.items ?? [],
    sizes: sizeRes?.items ?? [],
    fittings: fittingRes?.items ?? [],
  };
}

export default function StockPage() {
  const [rows, setRows] = useState<Stock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [colorItems, setColorItems] = useState<AttributeItem[]>([]);
  const [sizeItems, setSizeItems] = useState<AttributeItem[]>([]);
  const [fittingItems, setFittingItems] = useState<AttributeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editing, setEditing] = useState<Stock | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [stocksRes, productsRes, attributesRes] = await Promise.all([
        stockService.list({ limit: 100 }),
        productService.list({ limit: 100 }),
        attributeService.list({ limit: 100 }),
      ]);
      setRows(stocksRes.items);
      setProducts(productsRes.items);

      const { colors, sizes, fittings } = await loadAttributeGroups(attributesRes.items);
      setColorItems(colors);
      setSizeItems(sizes);
      setFittingItems(fittings);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load stock"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [stocksRes, productsRes, attributesRes] = await Promise.all([
          stockService.list({ limit: 100 }),
          productService.list({ limit: 100 }),
          attributeService.list({ limit: 100 }),
        ]);
        setRows(stocksRes.items);
        setProducts(productsRes.items);

        const { colors, sizes, fittings } = await loadAttributeGroups(attributesRes.items);
        setColorItems(colors);
        setSizeItems(sizes);
        setFittingItems(fittings);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load stock"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const productTitleById = useMemo(() => new Map(products.map((p) => [p.id, p.title])), [products]);

  const columns = useMemo<ColumnDef<Stock, unknown>[]>(
    () => [
      {
        id: "product",
        header: "Product",
        accessorFn: (row) => productTitleById.get(row.product_id) ?? "—",
      },
      {
        id: "variant",
        header: "Variant",
        cell: ({ row }) => {
          const parts = [row.original.color?.title, row.original.size?.title, row.original.fitting?.title].filter(
            (title): title is string => !!title
          );
          return parts.length ? parts.join(" / ") : "—";
        },
      },
      { accessorKey: "stock_qty", header: "Quantity", cell: ({ getValue }) => getValue() ?? "Unlimited" },
      {
        accessorKey: "stock_price",
        header: "Price",
        cell: ({ getValue }) => (getValue() ? `$${Number(getValue()).toFixed(2)}` : "—"),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={stockStatus(row.original.stock_qty)} />,
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
              onDelete={() => setDeletingId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [productTitleById]
  );

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);

    const toNumberOrNull = (v: FormDataEntryValue | null) => (v ? Number(v) : null);

    const payload = {
      product_id: Number(formData.get("product_id")),
      stock_qty: toNumberOrNull(formData.get("stock_qty")),
      stock_price: toNumberOrNull(formData.get("stock_price")) ?? undefined,
      stock_dis_price: Number(formData.get("stock_dis_price") ?? 0),
      stock_dis_percentage: Number(formData.get("stock_dis_percentage") ?? 0),
      weight: toNumberOrNull(formData.get("weight")) ?? undefined,
      color_id: toNumberOrNull(formData.get("color_id")),
      size_id: toNumberOrNull(formData.get("size_id")),
      fitting_id: toNumberOrNull(formData.get("fitting_id")),
    };

    try {
      if (editing) {
        await stockService.update(editing.id, payload);
        toast.success("Stock updated");
      } else {
        await stockService.create(payload);
        toast.success("Stock created");
      }
      setOpen(false);
      setEditing(null);
      await loadAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save stock"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await stockService.remove(deletingId);
      toast.success("Stock entry deleted");
      await loadAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete stock"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stock"
        description="Monitor and adjust inventory levels per product variation."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Stock" }]}
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
                <Button disabled={products.length === 0} onClick={() => setEditing(null)}>
                  <Plus />
                  Add Stock
                </Button>
              }
            />
            <SheetContent>
              <form action={handleSubmit} className="flex h-full flex-col overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Stock" : "Add Stock"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update inventory for this variation." : "Add an inventory row for a product."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="product_id">Product</Label>
                    <Select name="product_id" defaultValue={String(editing?.product_id ?? products[0]?.id ?? "")}>
                      <SelectTrigger id="product_id" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="color_id">Color</Label>
                      <Select name="color_id" defaultValue={editing?.color_id ? String(editing.color_id) : undefined}>
                        <SelectTrigger id="color_id" className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorItems.map((i) => (
                            <SelectItem key={i.id} value={String(i.id)}>
                              {i.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {colorItems.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No &quot;Color&quot; attribute yet — create one under Attributes first.
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="size_id">Size</Label>
                      <Select name="size_id" defaultValue={editing?.size_id ? String(editing.size_id) : undefined}>
                        <SelectTrigger id="size_id" className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeItems.map((i) => (
                            <SelectItem key={i.id} value={String(i.id)}>
                              {i.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {sizeItems.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No &quot;Size&quot; attribute yet — create one under Attributes first.
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fitting_id">Fitting</Label>
                      <Select name="fitting_id" defaultValue={editing?.fitting_id ? String(editing.fitting_id) : undefined}>
                        <SelectTrigger id="fitting_id" className="w-full">
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {fittingItems.map((i) => (
                            <SelectItem key={i.id} value={String(i.id)}>
                              {i.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fittingItems.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No &quot;Fitting&quot; attribute yet — create one under Attributes first.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_qty">Quantity (blank = unlimited)</Label>
                      <Input id="stock_qty" name="stock_qty" type="number" defaultValue={editing?.stock_qty ?? ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_price">Price override</Label>
                      <Input id="stock_price" name="stock_price" type="number" step="0.01" defaultValue={editing?.stock_price ?? ""} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_dis_price">Discount price</Label>
                      <Input id="stock_dis_price" name="stock_dis_price" type="number" step="0.01" defaultValue={editing?.stock_dis_price ?? 0} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_dis_percentage">Discount %</Label>
                      <Input id="stock_dis_percentage" name="stock_dis_percentage" type="number" defaultValue={editing?.stock_dis_percentage ?? 0} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="weight">Weight</Label>
                    <Input id="weight" name="weight" type="number" step="0.01" defaultValue={editing?.weight ?? ""} />
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create stock"}
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
        searchPlaceholder="Search by product..."
        searchColumn="product"
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this stock entry?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
