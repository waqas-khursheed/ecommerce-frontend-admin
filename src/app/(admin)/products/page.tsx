"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { brandService } from "@/services/brand.service";
import { tagService, productTagService } from "@/services/tag.service";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { productSchema } from "@/lib/validations/product.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { Brand } from "@/types/brand";
import type { ProductTag } from "@/types/tag";

export default function ProductsPage() {
  const { items: rows, isLoading, reload: loadAll, pagination, search, setSearch } = usePaginatedList(
    (params) => productService.list(params),
    { pageSize: 10, errorMessage: "Failed to load products" }
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);

  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [hoveredImageFile, setHoveredImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  // Drives whether the form shows the flat Quantity field or points at the
  // Stock module instead — see the "Pricing & inventory" section below.
  const [isVariation, setIsVariation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDelete, setBulkDelete] = useState<{ ids: number[]; clear: () => void } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Category/brand/tag pickers used by the product form — fetched once,
  // independent of which page of the (paginated) product table is showing.
  useEffect(() => {
    (async () => {
      try {
        const [categoriesRes, brandsRes, tagsRes] = await Promise.all([
          categoryService.list({ limit: 100 }),
          brandService.list({ limit: 100 }),
          tagService.list({ limit: 100 }),
        ]);
        setCategories(categoriesRes.items);
        setBrands(brandsRes.items);
        setTags(tagsRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load product form data"));
      }
    })();
  }, []);

  const brandTitleById = useMemo(() => new Map(brands.map((b) => [b.id, b.title])), [brands]);

  const brandItems = useMemo<ComboboxItem[]>(
    () => brands.map((b) => ({ value: String(b.id), label: b.title })),
    [brands]
  );

  useUnsavedChangesWarning(open && isDirty);

  const openCreate = () => {
    setEditing(null);
    setFeaturedImageFile(null);
    setHoveredImageFile(null);
    setGalleryFiles(null);
    setSelectedCategoryIds([]);
    setSelectedTagIds([]);
    setIsVariation(false);
    setErrors({});
    setIsDirty(false);
    setOpen(true);
  };

  const openEdit = async (product: Product) => {
    // The list endpoint doesn't eager-load productGalleries/assignCatToProducts
    // (only getById does), so re-fetch the full row here — otherwise the
    // edit form would always show an empty gallery and no selected categories
    // even though they're saved correctly in the database. Tag assignments
    // live in a separate table entirely (assign_tag_to_products), fetched here too.
    setFeaturedImageFile(null);
    setHoveredImageFile(null);
    setGalleryFiles(null);
    setEditing(product);
    setSelectedCategoryIds((product.assignCatToProducts ?? []).map((a) => a.category_id));
    setSelectedTagIds([]);
    setIsVariation(!!product.is_variation);
    setErrors({});
    setIsDirty(false);
    setOpen(true);

    try {
      const [full, productTags] = await Promise.all([
        productService.getById(product.id),
        productTagService.getByProduct(product.id),
      ]);
      setEditing(full);
      setSelectedCategoryIds((full.assignCatToProducts ?? []).map((a) => a.category_id));
      setSelectedTagIds(productTags.map((t) => t.tag_id));
      setIsVariation(!!full.is_variation);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load product details"));
    }
  };

  const columns = useMemo<ColumnDef<Product, unknown>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={uploadUrl("products", row.original.featured_image) ?? undefined}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{row.original.title}</p>
              <p className="text-xs text-muted-foreground">{row.original.sku ?? "—"}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "brand_id",
        header: "Brand",
        cell: ({ getValue }) => brandTitleById.get(getValue() as number) ?? "—",
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => `$${Number(getValue()).toFixed(2)}`,
      },
      {
        id: "stock",
        header: "Stock",
        // `quantity` only means anything for non-variant products — for a
        // variant product it's always 0 by convention (real stock lives per
        // variant in the Stock module), so showing it here would read as
        // "out of stock" even when it isn't. Show the honest aggregate
        // instead, with a hint when no variant stock has been set up yet.
        cell: ({ row }) => {
          if (!row.original.is_variation) return row.original.quantity;
          const total = row.original.variant_stock_total;
          if (total === null) {
            return <span className="text-muted-foreground">Not set up</span>;
          }
          return `${total} (variants)`;
        },
      },
      {
        accessorKey: "sold",
        header: "Sold",
        cell: ({ getValue }) => getValue() as number,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() === 1 ? "Active" : "Draft"} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => openEdit(row.original)}
              onDelete={() => setDeletingId(row.original.id)}
              extraActions={
                row.original.is_variation ? (
                  <DropdownMenuItem render={<Link href={`/stock?product_id=${row.original.id}`} />}>
                    <Boxes />
                    Manage Stock
                  </DropdownMenuItem>
                ) : undefined
              }
            />
          </div>
        ),
      },
    ],
    [brandTitleById]
  );

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(productSchema, {
      title: String(formData.get("title") ?? ""),
      price: String(formData.get("price") ?? ""),
      d_price: String(formData.get("d_price") ?? "0"),
      d_percentage: String(formData.get("d_percentage") ?? "0"),
      quantity: String(formData.get("quantity") ?? ""),
      sku: String(formData.get("sku") ?? ""),
      status: String(formData.get("status") ?? "1"),
      meta_keywords: String(formData.get("meta_keywords") ?? ""),
      meta_description: String(formData.get("meta_description") ?? ""),
      brand_id: formData.get("brand_id") ? String(formData.get("brand_id")) : null,
    });

    const imageErrors: FieldErrors = {};
    if (!editing && !featuredImageFile) imageErrors.featured_image = "Featured image is required";

    if (!data || Object.keys(imageErrors).length > 0) {
      setErrors({ ...validationErrors, ...imageErrors });
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const payload = new FormData();
    const textFields = [
      "title", "short_desc", "long_desc", "features", "inside_box", "sku",
      "video_1", "video_2", "featured_image_alt", "featured_image_title",
      "hovered_image_alt", "hovered_image_title", "meta_keywords", "meta_description",
    ];
    for (const field of textFields) {
      payload.append(field, String(formData.get(field) ?? ""));
    }

    payload.append("price", String(formData.get("price") ?? "0"));
    payload.append("d_price", String(formData.get("d_price") ?? "0"));
    payload.append("d_percentage", String(formData.get("d_percentage") ?? "0"));
    payload.append("quantity", String(formData.get("quantity") ?? "0"));
    payload.append("status", String(formData.get("status") ?? "1"));
    payload.append("weight", String(formData.get("weight") ?? "0"));
    payload.append("new_arrival", formData.get("new_arrival") ? "1" : "0");
    payload.append("best_seller", formData.get("best_seller") ? "1" : "0");
    payload.append("is_variation", formData.get("is_variation") ? "1" : "0");
    payload.append("is_prescription", formData.get("is_prescription") ? "1" : "0");

    const brandId = formData.get("brand_id");
    if (brandId) payload.append("brand_id", String(brandId));

    payload.append("category_ids", selectedCategoryIds.join(","));

    if (featuredImageFile) payload.append("featured_image", featuredImageFile);
    if (hoveredImageFile) payload.append("hovered_image", hoveredImageFile);
    if (galleryFiles) {
      Array.from(galleryFiles).forEach((file) => payload.append("gallery", file));
    }

    try {
      let productId = editing?.id;
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success(`"${formData.get("title")}" updated`);
      } else {
        const created = await productService.create(payload);
        productId = created.id;
        toast.success(`"${formData.get("title")}" created`);
      }
      // Tag assignment lives in its own table (assign_tag_to_products), not
      // part of the product create/update payload — synced separately here.
      if (productId) await productTagService.sync(productId, selectedTagIds);
      setIsDirty(false);
      setOpen(false);
      setEditing(null);
      await loadAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save product"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const target = rows.find((r) => r.id === deletingId);

    try {
      await productService.remove(deletingId);
      toast.success(`"${target?.title}" deleted`);
      await loadAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete product"));
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkDelete) return;
    try {
      const result = await productService.bulkRemove(bulkDelete.ids);
      toast.success(`${result.deleted} product(s) deleted`);
      bulkDelete.clear();
      await loadAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete selected products"));
    }
  };

  const handleRemoveGalleryImage = async (galleryId: number) => {
    try {
      await productService.removeGalleryImage(galleryId);
      setEditing((prev) =>
        prev ? { ...prev, productGalleries: prev.productGalleries?.filter((g) => g.id !== galleryId) } : prev
      );
      toast.success("Gallery image removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove image"));
    }
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
              if (!v && isDirty && !window.confirm("You have unsaved changes. Discard them?")) {
                return;
              }
              setOpen(v);
              if (!v) {
                setEditing(null);
                setIsDirty(false);
              }
            }}
          >
            <SheetTrigger render={<Button onClick={openCreate}><Plus />Add Product</Button>} />
            <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
              <form
                action={handleSubmit}
                onChange={() => setIsDirty(true)}
                className="flex h-full flex-col overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Product" : "Add Product"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update product details." : "Add a new product to your catalog."}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 px-4">
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Basic info</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="title" required>Title</Label>
                      <Input
                        id="title"
                        name="title"
                        defaultValue={editing?.title}
                        aria-invalid={!!errors.title}
                        onChange={() => errors.title && setErrors((prev) => ({ ...prev, title: "" }))}
                      />
                      <FieldError message={errors.title} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="short_desc">Short description</Label>
                      <Textarea id="short_desc" name="short_desc" defaultValue={editing?.short_desc ?? ""} rows={2} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="long_desc">Long description</Label>
                      <Textarea id="long_desc" name="long_desc" defaultValue={editing?.long_desc ?? ""} rows={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="features">Features</Label>
                        <Textarea id="features" name="features" defaultValue={editing?.features ?? ""} rows={2} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="inside_box">Inside the box</Label>
                        <Textarea id="inside_box" name="inside_box" defaultValue={editing?.inside_box ?? ""} rows={2} />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Pricing & inventory</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="price" required>Price</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          defaultValue={editing?.price}
                          aria-invalid={!!errors.price}
                          onChange={() => errors.price && setErrors((prev) => ({ ...prev, price: "" }))}
                        />
                        <FieldError message={errors.price} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="d_price">Discount price</Label>
                        <Input
                          id="d_price"
                          name="d_price"
                          type="number"
                          step="0.01"
                          defaultValue={editing?.d_price ?? 0}
                          aria-invalid={!!errors.d_price}
                          onChange={() => errors.d_price && setErrors((prev) => ({ ...prev, d_price: "" }))}
                        />
                        <FieldError message={errors.d_price} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="d_percentage">Discount %</Label>
                        <Input
                          id="d_percentage"
                          name="d_percentage"
                          type="number"
                          defaultValue={editing?.d_percentage ?? 0}
                          aria-invalid={!!errors.d_percentage}
                          onChange={() => errors.d_percentage && setErrors((prev) => ({ ...prev, d_percentage: "" }))}
                        />
                        <FieldError message={errors.d_percentage} />
                      </div>
                    </div>
                    <div className={isVariation ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
                      {!isVariation && (
                        <div className="space-y-1.5">
                          <Label htmlFor="quantity" required>Quantity</Label>
                          <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            defaultValue={editing?.quantity}
                            aria-invalid={!!errors.quantity}
                            onChange={() => errors.quantity && setErrors((prev) => ({ ...prev, quantity: "" }))}
                          />
                          <FieldError message={errors.quantity} />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" name="sku" defaultValue={editing?.sku ?? ""} />
                      </div>
                    </div>
                    {isVariation && (
                      <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                        <p>Stock for this product is tracked per-variant in the Stock module, not here.</p>
                        {editing && (
                          <Link
                            href={`/stock?product_id=${editing.id}`}
                            className="mt-2 inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
                          >
                            <Boxes className="size-4" />
                            Manage stock for this product
                          </Link>
                        )}
                        {!editing && <p className="mt-1">You can add variant stock once this product is created.</p>}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <Label htmlFor="weight">Weight</Label>
                      <Input id="weight" name="weight" type="number" step="0.01" defaultValue={editing?.weight ?? ""} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Images</h3>
                    <ImageUploadField
                      id="featured_image"
                      label="Featured image"
                      required={!editing}
                      error={errors.featured_image}
                      existingImageUrl={uploadUrl("products", editing?.featured_image)}
                      onFileChange={(f) => {
                        setFeaturedImageFile(f);
                        if (f && errors.featured_image) setErrors((prev) => ({ ...prev, featured_image: "" }));
                      }}
                    />
                    <ImageUploadField
                      id="hovered_image"
                      label="Hovered image"
                      existingImageUrl={uploadUrl("products", editing?.hovered_image)}
                      onFileChange={setHoveredImageFile}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="gallery">Gallery (add more images)</Label>
                      <Input
                        id="gallery"
                        name="gallery"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => setGalleryFiles(e.target.files)}
                      />
                      {editing && editing.productGalleries && editing.productGalleries.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {editing.productGalleries.map((g) => (
                            <div key={g.id} className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={uploadUrl("products", g.image) ?? undefined}
                                alt=""
                                className="size-14 rounded-md border object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(g.id)}
                                aria-label="Remove gallery image"
                                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">Organization</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="brand_id">Brand</Label>
                      <Combobox
                        id="brand_id"
                        name="brand_id"
                        defaultValue={editing?.brand_id ? String(editing.brand_id) : undefined}
                        placeholder="Search brands..."
                        items={brandItems}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Categories</Label>
                      <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
                        {categories.map((c) => (
                          <label key={c.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={selectedCategoryIds.includes(c.id)}
                              onCheckedChange={(checked) =>
                                setSelectedCategoryIds((prev) =>
                                  checked ? [...prev, c.id] : prev.filter((id) => id !== c.id)
                                )
                              }
                            />
                            {c.title}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tags</Label>
                      <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-3">
                        {tags.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={selectedTagIds.includes(t.id)}
                              onCheckedChange={(checked) =>
                                setSelectedTagIds((prev) =>
                                  checked ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                                )
                              }
                            />
                            {t.name}
                          </label>
                        ))}
                        {tags.length === 0 && (
                          <p className="col-span-2 text-xs text-muted-foreground">No tags yet.</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox name="new_arrival" defaultChecked={editing?.new_arrival === 1} />
                        New arrival
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox name="best_seller" defaultChecked={editing?.best_seller === 1} />
                        Best seller
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          name="is_variation"
                          checked={isVariation}
                          onCheckedChange={(checked) => setIsVariation(!!checked)}
                        />
                        Has variations (size/color)
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox name="is_prescription" defaultChecked={editing?.is_prescription} />
                        Requires prescription
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={String(editing?.status ?? 1)}>
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue>{(value: string) => (value === "1" ? "Active" : "Draft")}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground">SEO & meta</h3>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta_keywords">Meta keywords</Label>
                      <Input id="meta_keywords" name="meta_keywords" defaultValue={editing?.meta_keywords ?? ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="meta_description">Meta description</Label>
                      <Textarea id="meta_description" name="meta_description" defaultValue={editing?.meta_description ?? ""} rows={2} />
                    </div>
                  </section>
                </div>

                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create product"}
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
        searchPlaceholder="Search products..."
        searchColumn="title"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
        rowSelection={{
          getRowId: (row) => row.id,
          actions: (selectedIds, clearSelection) => (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDelete({ ids: selectedIds as number[], clear: clearSelection })}
            >
              <Trash2 className="size-4" />
              Delete selected
            </Button>
          ),
        }}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this product?"
        onConfirm={handleDelete}
      />

      <ConfirmDeleteDialog
        open={bulkDelete !== null}
        onOpenChange={(v) => !v && setBulkDelete(null)}
        title={`Delete ${bulkDelete?.ids.length ?? 0} selected product(s)?`}
        description="This action cannot be undone."
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
