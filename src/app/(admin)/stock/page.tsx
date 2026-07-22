"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";
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
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { stockService } from "@/services/stock.service";
import { productService } from "@/services/product.service";
import { attributeService, attributeItemService } from "@/services/attribute.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { stockSchema } from "@/lib/validations/stock.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { Stock } from "@/types/stock";
import type { Product } from "@/types/product";
import type { Attribute, AttributeItem } from "@/types/attribute";

function stockStatus(qty: number | null) {
  if (qty === null) return "In stock";
  if (qty === 0) return "Out of stock";
  if (qty < 10) return "Low";
  return "In stock";
}

// Stock only has 3 physical variant columns (color_id/size_id/fitting_id),
// but they're generic slots, not literally always Color/Size/Fitting — a
// kitchenware product might use "Capacity" and "Material" instead. Whichever
// ProductAttribute *types* a product's existing stock rows already use get
// sorted ascending by their real id and mapped onto the 3 slots positionally
// (lowest id -> color_id, next -> size_id, next -> fitting_id). This must
// stay in lockstep with frontend_user's src/lib/variants.ts, which derives
// the same product's variant display the same way from the same data.
const SLOT_NAMES = ["color_id", "size_id", "fitting_id"] as const;

interface AttributeSlot {
  attribute: Attribute;
  items: AttributeItem[];
}

async function fetchItemsForAttribute(attributeId: number): Promise<AttributeItem[]> {
  const res = await attributeItemService.list({ limit: 100, attribute_id: attributeId });
  return res.items;
}

async function deriveSlotsForProduct(productId: number, attributes: Attribute[]): Promise<AttributeSlot[]> {
  const attributeById = new Map(attributes.map((a) => [a.id, a]));
  const { items: existingStocks } = await stockService.list({ product_id: productId, limit: 100 });

  const typeIds = new Set<number>();
  for (const stock of existingStocks) {
    if (stock.color) typeIds.add(stock.color.attribute_id);
    if (stock.size) typeIds.add(stock.size.attribute_id);
    if (stock.fitting) typeIds.add(stock.fitting.attribute_id);
  }

  const sortedIds = Array.from(typeIds)
    .sort((a, b) => a - b)
    .slice(0, SLOT_NAMES.length);

  const slots: AttributeSlot[] = [];
  for (const id of sortedIds) {
    const attribute = attributeById.get(id);
    if (!attribute) continue;
    slots.push({ attribute, items: await fetchItemsForAttribute(id) });
  }
  return slots;
}

function StockPageContent() {
  // Seeded from the Products page's "Manage Stock" row action
  // (?product_id=N) so jumping there shows just that product's variants
  // instead of the whole, unfiltered stock list.
  const searchParams = useSearchParams();
  const filterProductId = searchParams.get("product_id");

  const {
    items: rows,
    isLoading,
    reload: loadAll,
    pagination,
    search,
    setSearch,
  } = usePaginatedList(
    (params) => stockService.list({ ...params, product_id: filterProductId ?? undefined }),
    { pageSize: 10, errorMessage: "Failed to load stock" }
  );
  const [products, setProducts] = useState<Product[]>([]);
  const productItems = useMemo<ComboboxItem[]>(
    () => products.map((p) => ({ value: String(p.id), label: p.title })),
    [products]
  );
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [slots, setSlots] = useState<AttributeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Record<number, number | undefined>>({});
  const [pendingNewType, setPendingNewType] = useState<string | undefined>(undefined);

  const [editing, setEditing] = useState<Stock | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Product list + the full catalog of attribute *types* — fetched once,
  // independent of which page of the (paginated) stock table is showing.
  // Which types actually apply to a given product (and their item values)
  // is derived per-product when the form opens; see loadSlotsForProduct.
  useEffect(() => {
    (async () => {
      try {
        const [productsRes, attributesRes] = await Promise.all([
          productService.list({ limit: 100 }),
          attributeService.list({ limit: 100 }),
        ]);
        // Only variant products (is_variation) are ever read from `stocks`
        // at checkout/display time — offering the rest here would let an
        // admin "add stock" for a product where it can never be seen
        // (the backend now also rejects this, but filtering it out of the
        // picker avoids the dead end in the first place).
        setProducts(productsRes.items.filter((p) => p.is_variation));
        setAttributes(attributesRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load stock form data"));
      }
    })();
  }, []);

  const loadSlotsForProduct = async (productId: number, existingStock?: Stock | null) => {
    setSlotsLoading(true);
    setPendingNewType(undefined);
    try {
      const nextSlots = await deriveSlotsForProduct(productId, attributes);
      setSlots(nextSlots);

      const preselected: Record<number, number | undefined> = {};
      if (existingStock) {
        const values = [existingStock.color_id, existingStock.size_id, existingStock.fitting_id];
        nextSlots.forEach((slot, index) => {
          preselected[slot.attribute.id] = values[index] ?? undefined;
        });
      }
      setSelectedItemIds(preselected);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load this product's attribute types"));
    } finally {
      setSlotsLoading(false);
    }
  };

  const addSlot = async (attribute: Attribute) => {
    try {
      const items = await fetchItemsForAttribute(attribute.id);
      setSlots((prev) => [...prev, { attribute, items }].sort((a, b) => a.attribute.id - b.attribute.id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load attribute values"));
    } finally {
      setPendingNewType(undefined);
    }
  };

  const availableTypesToAdd = useMemo(
    () => attributes.filter((a) => !slots.some((s) => s.attribute.id === a.id)),
    [attributes, slots]
  );

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
                setSelectedProductId(row.original.product_id);
                setErrors({});
                setOpen(true);
                void loadSlotsForProduct(row.original.product_id, row.original);
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
    const orNull = (v: FormDataEntryValue | null) => (v ? String(v) : null);

    const { data: payload, errors: validationErrors } = validateForm(stockSchema, {
      product_id: String(formData.get("product_id") ?? ""),
      stock_qty: orNull(formData.get("stock_qty")),
      stock_price: orNull(formData.get("stock_price")),
      stock_dis_price: String(formData.get("stock_dis_price") ?? "0"),
      stock_dis_percentage: String(formData.get("stock_dis_percentage") ?? "0"),
      weight: orNull(formData.get("weight")),
      color_id: orNull(formData.get("color_id")),
      size_id: orNull(formData.get("size_id")),
      fitting_id: orNull(formData.get("fitting_id")),
    });
    if (!payload) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const submitPayload = {
      ...payload,
      stock_price: payload.stock_price ?? undefined,
      weight: payload.weight ?? undefined,
    };

    try {
      if (editing) {
        await stockService.update(editing.id, submitPayload);
        toast.success("Stock updated");
      } else {
        await stockService.create(submitPayload);
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
                <Button
                  disabled={products.length === 0}
                  onClick={() => {
                    setEditing(null);
                    setErrors({});
                    // Default to whichever product this page is filtered
                    // to (arrived via "Manage Stock" from Products), else
                    // just the first product in the picker.
                    const preselected = filterProductId ? Number(filterProductId) : undefined;
                    const defaultProductId =
                      (preselected && products.some((p) => p.id === preselected) ? preselected : undefined) ??
                      products[0]?.id;
                    setSelectedProductId(defaultProductId ?? null);
                    if (defaultProductId) void loadSlotsForProduct(defaultProductId);
                  }}
                >
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
                    <Combobox
                      id="product_id"
                      name="product_id"
                      placeholder="Search products..."
                      value={selectedProductId ? String(selectedProductId) : null}
                      onValueChange={(v) => {
                        if (!v) return;
                        const id = Number(v);
                        setSelectedProductId(id);
                        void loadSlotsForProduct(id);
                      }}
                      items={productItems}
                    />
                  </div>

                  {slotsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading this product&apos;s variant types...</p>
                  ) : (
                    <div className="space-y-3">
                      {slots.length > 0 && (
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${slots.length}, minmax(0, 1fr))` }}>
                          {slots.map((slot, index) => {
                            const name = SLOT_NAMES[index];
                            return (
                              <div className="space-y-1.5" key={slot.attribute.id}>
                                <Label htmlFor={name}>{slot.attribute.attribute_title}</Label>
                                <Select
                                  name={name}
                                  value={
                                    selectedItemIds[slot.attribute.id] ? String(selectedItemIds[slot.attribute.id]) : undefined
                                  }
                                  onValueChange={(v) =>
                                    setSelectedItemIds((prev) => ({ ...prev, [slot.attribute.id]: Number(v) }))
                                  }
                                >
                                  <SelectTrigger id={name} className="w-full">
                                    <SelectValue placeholder="—">
                                      {(value: string) => slot.items.find((i) => String(i.id) === value)?.title ?? value}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {slot.items.map((i) => (
                                      <SelectItem key={i.id} value={String(i.id)}>
                                        {i.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {slots.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          This product has no variant types yet — add one below (e.g. Color, Size, or anything
                          else you&apos;ve created under Attributes) if this variation needs one.
                        </p>
                      )}

                      {slots.length < SLOT_NAMES.length && availableTypesToAdd.length > 0 && (
                        <div className="space-y-1.5">
                          <Label>Add a variant type</Label>
                          <Select
                            value={pendingNewType}
                            onValueChange={(v) => {
                              setPendingNewType(v ?? undefined);
                              const attribute = availableTypesToAdd.find((a) => String(a.id) === v);
                              if (attribute) void addSlot(attribute);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="e.g. Color, Size, Capacity...">
                                {(value: string) =>
                                  availableTypesToAdd.find((a) => String(a.id) === value)?.attribute_title ?? value
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {availableTypesToAdd.map((a) => (
                                <SelectItem key={a.id} value={String(a.id)}>
                                  {a.attribute_title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_qty">Quantity (blank = unlimited)</Label>
                      <Input
                        id="stock_qty"
                        name="stock_qty"
                        type="number"
                        defaultValue={editing?.stock_qty ?? ""}
                        aria-invalid={!!errors.stock_qty}
                        onChange={() => errors.stock_qty && setErrors((prev) => ({ ...prev, stock_qty: "" }))}
                      />
                      <FieldError message={errors.stock_qty} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_price">Price override</Label>
                      <Input
                        id="stock_price"
                        name="stock_price"
                        type="number"
                        step="0.01"
                        defaultValue={editing?.stock_price ?? ""}
                        aria-invalid={!!errors.stock_price}
                        onChange={() => errors.stock_price && setErrors((prev) => ({ ...prev, stock_price: "" }))}
                      />
                      <FieldError message={errors.stock_price} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_dis_price">Discount price</Label>
                      <Input
                        id="stock_dis_price"
                        name="stock_dis_price"
                        type="number"
                        step="0.01"
                        defaultValue={editing?.stock_dis_price ?? 0}
                        aria-invalid={!!errors.stock_dis_price}
                        onChange={() => errors.stock_dis_price && setErrors((prev) => ({ ...prev, stock_dis_price: "" }))}
                      />
                      <FieldError message={errors.stock_dis_price} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stock_dis_percentage">Discount %</Label>
                      <Input
                        id="stock_dis_percentage"
                        name="stock_dis_percentage"
                        type="number"
                        defaultValue={editing?.stock_dis_percentage ?? 0}
                        aria-invalid={!!errors.stock_dis_percentage}
                        onChange={() =>
                          errors.stock_dis_percentage && setErrors((prev) => ({ ...prev, stock_dis_percentage: "" }))
                        }
                      />
                      <FieldError message={errors.stock_dis_percentage} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      defaultValue={editing?.weight ?? ""}
                      aria-invalid={!!errors.weight}
                      onChange={() => errors.weight && setErrors((prev) => ({ ...prev, weight: "" }))}
                    />
                    <FieldError message={errors.weight} />
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

      {filterProductId && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Showing stock for:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-medium">
            {productTitleById.get(Number(filterProductId)) ?? `Product #${filterProductId}`}
            <Link href="/stock" aria-label="Clear product filter" className="text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </Link>
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search by product..."
        searchColumn="product"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
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

export default function StockPage() {
  return (
    <Suspense fallback={null}>
      <StockPageContent />
    </Suspense>
  );
}
