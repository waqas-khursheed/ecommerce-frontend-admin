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
import { ImageUploadField } from "@/components/data-table/image-upload-field";
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
import { categoryService } from "@/services/category.service";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { categorySchema } from "@/lib/validations/category.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { Category } from "@/types/category";

export default function CategoriesPage() {
  const { items: rows, isLoading, reload: loadCategories, pagination, search, setSearch } = usePaginatedList(
    (params) => categoryService.list(params),
    { pageSize: 10, errorMessage: "Failed to load categories" }
  );
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  // The "Parent category" picker needs every category, not just the current
  // table page — kept as a separate, un-paginated fetch from the table rows.
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const loadAllCategories = useCallback(async () => {
    try {
      const { items } = await categoryService.list({ limit: 100 });
      setAllCategories(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load categories"));
    }
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const { items } = await categoryService.list({ limit: 100 });
        setAllCategories(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load categories"));
      }
    })();
  }, []);

  const parentTitleById = useMemo(() => new Map(allCategories.map((r) => [r.id, r.title])), [allCategories]);

  const columns = useMemo<ColumnDef<Category, unknown>[]>(
    () => [
      { accessorKey: "title", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "parent_id",
        header: "Parent",
        cell: ({ getValue }) => {
          const parentId = getValue() as number;
          return parentId ? parentTitleById.get(parentId) ?? "—" : "—";
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() === 1 ? "Active" : "Inactive"} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                setEditing(row.original);
                setImageFile(null);
                setIconFile(null);
                setErrors({});
                setOpen(true);
              }}
              onDelete={() => setDeletingId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [parentTitleById]
  );

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(categorySchema, {
      title: String(formData.get("title") ?? ""),
      status: String(formData.get("status") ?? "1"),
      order_by: String(formData.get("order_by") ?? "0"),
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("title", String(formData.get("title") ?? ""));
    payload.append("description", String(formData.get("description") ?? ""));
    payload.append("meta_title", String(formData.get("meta_title") ?? ""));
    payload.append("meta_keywords", String(formData.get("meta_keywords") ?? ""));
    payload.append("meta_desc", String(formData.get("meta_desc") ?? ""));
    payload.append("status", String(formData.get("status") ?? "1"));
    payload.append("order_by", String(formData.get("order_by") ?? "0"));
    payload.append("is_size_chart", formData.get("is_size_chart") ? "true" : "false");

    const parentId = formData.get("parent_id");
    if (parentId && parentId !== "0") payload.append("parent_id", String(parentId));

    if (imageFile) payload.append("image", imageFile);
    if (iconFile) payload.append("icon", iconFile);

    try {
      if (editing) {
        await categoryService.update(editing.id, payload);
        toast.success(`"${formData.get("title")}" updated`);
      } else {
        await categoryService.create(payload);
        toast.success(`"${formData.get("title")}" created`);
      }
      setOpen(false);
      setEditing(null);
      await Promise.all([loadCategories(), loadAllCategories()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const target = rows.find((r) => r.id === deletingId);

    try {
      await categoryService.remove(deletingId);
      toast.success(`"${target?.title}" deleted`);
      await Promise.all([loadCategories(), loadAllCategories()]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete category"));
    } finally {
      setDeletingId(null);
    }
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
                <Button
                  onClick={() => {
                    setEditing(null);
                    setImageFile(null);
                    setIconFile(null);
                    setErrors({});
                  }}
                >
                  <Plus />
                  Add Category
                </Button>
              }
            />
            <SheetContent className="sm:max-w-md overflow-y-auto">
              <form action={handleSubmit} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Category" : "Add Category"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update category details." : "Create a new product category."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" required>Name</Label>
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} rows={3} />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="parent_id">Parent category</Label>
                    <Select name="parent_id" defaultValue={String(editing?.parent_id ?? 0)}>
                      <SelectTrigger id="parent_id" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None (top-level)</SelectItem>
                        {allCategories
                          .filter((r) => r.id !== editing?.id)
                          .map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <ImageUploadField
                    id="image"
                    label="Image"
                    existingImageUrl={uploadUrl("categories", editing?.image)}
                    onFileChange={setImageFile}
                  />
                  <ImageUploadField
                    id="icon"
                    label="Icon"
                    existingImageUrl={uploadUrl("categories", editing?.icon)}
                    onFileChange={setIconFile}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="order_by">Display order</Label>
                      <Input
                        id="order_by"
                        name="order_by"
                        type="number"
                        defaultValue={editing?.order_by ?? 0}
                        aria-invalid={!!errors.order_by}
                        onChange={() => errors.order_by && setErrors((prev) => ({ ...prev, order_by: "" }))}
                      />
                      <FieldError message={errors.order_by} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue={String(editing?.status ?? 1)}>
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_size_chart"
                      name="is_size_chart"
                      defaultChecked={editing?.is_size_chart ?? false}
                    />
                    <Label htmlFor="is_size_chart" className="font-normal">
                      Has a size chart
                    </Label>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="meta_title">Meta title</Label>
                    <Input id="meta_title" name="meta_title" defaultValue={editing?.meta_title ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta_keywords">Meta keywords</Label>
                    <Input id="meta_keywords" name="meta_keywords" defaultValue={editing?.meta_keywords ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta_desc">Meta description</Label>
                    <Textarea id="meta_desc" name="meta_desc" defaultValue={editing?.meta_desc ?? ""} rows={2} />
                  </div>
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create category"}
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
        searchPlaceholder="Search categories..."
        searchColumn="title"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this category?"
        description="Categories with subcategories can't be deleted — remove or reassign the children first."
        onConfirm={handleDelete}
      />
    </div>
  );
}
