"use client";

import { useMemo, useState } from "react";
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
import { brandService } from "@/services/brand.service";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { brandSchema } from "@/lib/validations/brand.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { Brand } from "@/types/brand";

export default function BrandsPage() {
  const { items: rows, isLoading, reload: loadBrands, pagination } = usePaginatedList(
    (params) => brandService.list(params),
    { pageSize: 10, errorMessage: "Failed to load brands" }
  );
  const [editing, setEditing] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const columns = useMemo<ColumnDef<Brand, unknown>[]>(
    () => [
      { accessorKey: "title", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
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
                setLogoFile(null);
                setBannerFile(null);
                setErrors({});
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

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(brandSchema, {
      title: String(formData.get("title") ?? ""),
      status: String(formData.get("status") ?? "1"),
    });

    const imageErrors: FieldErrors = {};
    if (!editing && !logoFile) imageErrors.logo = "Logo is required";
    if (!editing && !bannerFile) imageErrors.banner = "Banner is required";

    if (!data || Object.keys(imageErrors).length > 0) {
      setErrors({ ...validationErrors, ...imageErrors });
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("title", String(formData.get("title") ?? ""));
    payload.append("description", String(formData.get("description") ?? ""));
    payload.append("status", String(formData.get("status") ?? "1"));
    if (logoFile) payload.append("logo", logoFile);
    if (bannerFile) payload.append("banner", bannerFile);

    try {
      if (editing) {
        await brandService.update(editing.id, payload);
        toast.success(`"${formData.get("title")}" updated`);
      } else {
        await brandService.create(payload);
        toast.success(`"${formData.get("title")}" created`);
      }
      setOpen(false);
      setEditing(null);
      await loadBrands();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save brand"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const target = rows.find((r) => r.id === deletingId);

    try {
      await brandService.remove(deletingId);
      toast.success(`"${target?.title}" deleted`);
      await loadBrands();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete brand"));
    } finally {
      setDeletingId(null);
    }
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
                <Button
                  onClick={() => {
                    setEditing(null);
                    setLogoFile(null);
                    setBannerFile(null);
                    setErrors({});
                  }}
                >
                  <Plus />
                  Add Brand
                </Button>
              }
            />
            <SheetContent className="overflow-y-auto">
              <form action={handleSubmit} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Brand" : "Add Brand"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update brand details." : "Create a new brand."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Name</Label>
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

                  <ImageUploadField
                    id="logo"
                    label="Logo"
                    required={!editing}
                    error={errors.logo}
                    existingImageUrl={uploadUrl("brands", editing?.logo)}
                    onFileChange={(f) => {
                      setLogoFile(f);
                      if (f && errors.logo) setErrors((prev) => ({ ...prev, logo: "" }));
                    }}
                  />
                  <ImageUploadField
                    id="banner"
                    label="Banner"
                    required={!editing}
                    error={errors.banner}
                    existingImageUrl={uploadUrl("brands", editing?.banner)}
                    onFileChange={(f) => {
                      setBannerFile(f);
                      if (f && errors.banner) setErrors((prev) => ({ ...prev, banner: "" }));
                    }}
                  />

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
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create brand"}
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
        searchPlaceholder="Search brands..."
        searchColumn="title"
        pagination={pagination}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this brand?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
