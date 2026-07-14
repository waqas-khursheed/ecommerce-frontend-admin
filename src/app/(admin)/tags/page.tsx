"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { tagService } from "@/services/tag.service";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import type { ProductTag } from "@/types/tag";

function MetaTagsEditor({ tagId }: { tagId: number }) {
  const [terms, setTerms] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const rows = await tagService.getMetaTags(tagId);
        setTerms(rows.map((r) => r.meta_tag));
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load related terms"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [tagId]);

  const addTerm = () => {
    const value = draft.trim();
    if (!value || terms.includes(value)) return;
    setTerms((prev) => [...prev, value]);
    setDraft("");
  };

  const save = async () => {
    setIsSaving(true);
    try {
      await tagService.syncMetaTags(tagId, terms);
      toast.success("Related terms saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save related terms"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="space-y-2">
      <Label>Related search terms</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTerm();
            }
          }}
          placeholder="e.g. summer, clearance"
        />
        <Button type="button" variant="outline" onClick={addTerm}>
          Add
        </Button>
      </div>
      {terms.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {terms.map((term) => (
            <Badge key={term} variant="secondary" className="gap-1">
              {term}
              <button type="button" onClick={() => setTerms((prev) => prev.filter((t) => t !== term))}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Button type="button" size="sm" variant="outline" disabled={isSaving} onClick={save}>
        {isSaving ? "Saving..." : "Save terms"}
      </Button>
    </div>
  );
}

export default function TagsPage() {
  const [rows, setRows] = useState<ProductTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<ProductTag | null>(null);
  const [open, setOpen] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadTags = async () => {
    try {
      const { items } = await tagService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load tags"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await tagService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load tags"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setIconFile(null);
    setOgImageFile(null);
    setOpen(true);
  };

  const openEdit = (tag: ProductTag) => {
    setEditing(tag);
    setIconFile(null);
    setOgImageFile(null);
    setOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("name", String(formData.get("name") ?? ""));
    payload.append("description", String(formData.get("description") ?? ""));
    payload.append("meta_title", String(formData.get("meta_title") ?? ""));
    payload.append("meta_keywords", String(formData.get("meta_keywords") ?? ""));
    payload.append("meta_description", String(formData.get("meta_description") ?? ""));
    payload.append("body_description", String(formData.get("body_description") ?? ""));
    if (iconFile) payload.append("icon", iconFile);
    if (ogImageFile) payload.append("og_image", ogImageFile);

    try {
      if (editing) {
        await tagService.update(editing.id, payload);
        toast.success(`"${formData.get("name")}" updated`);
      } else {
        await tagService.create(payload);
        toast.success(`"${formData.get("name")}" created`);
      }
      setOpen(false);
      setEditing(null);
      await loadTags();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save tag"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await tagService.remove(deletingId);
      toast.success("Tag deleted");
      await loadTags();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete tag"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<ProductTag, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => (
          <span className="line-clamp-1 max-w-xs text-muted-foreground">{(getValue() as string) || "—"}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions onEdit={() => openEdit(row.original)} onDelete={() => setDeletingId(row.original.id)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tags"
        description="Storefront tags used to group and filter products."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Tags" }]}
        actions={
          <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
            <SheetTrigger render={<Button onClick={openCreate}><Plus />Add Tag</Button>} />
            <SheetContent className="overflow-y-auto">
              <form action={handleSubmit} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>{editing ? "Edit Tag" : "Add Tag"}</SheetTitle>
                  <SheetDescription>
                    {editing ? "Update this tag's details." : "Create a new product tag."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editing?.name} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" rows={3} defaultValue={editing?.description ?? ""} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ImageUploadField
                      id="icon"
                      label="Icon"
                      existingImageUrl={uploadUrl("tags", editing?.icon ?? undefined)}
                      onFileChange={setIconFile}
                    />
                    <ImageUploadField
                      id="og_image"
                      label="OG Image"
                      existingImageUrl={uploadUrl("tags", editing?.og_image ?? undefined)}
                      onFileChange={setOgImageFile}
                    />
                  </div>

                  <Separator />
                  <p className="text-sm font-semibold text-muted-foreground">SEO</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta_title">Meta title</Label>
                    <Input id="meta_title" name="meta_title" defaultValue={editing?.meta_title ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta_keywords">Meta keywords</Label>
                    <Input id="meta_keywords" name="meta_keywords" defaultValue={editing?.meta_keywords ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="meta_description">Meta description</Label>
                    <Textarea id="meta_description" name="meta_description" rows={2} defaultValue={editing?.meta_description ?? ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="body_description">Body description</Label>
                    <Textarea id="body_description" name="body_description" rows={3} defaultValue={editing?.body_description ?? ""} />
                  </div>

                  {editing && (
                    <>
                      <Separator />
                      <MetaTagsEditor tagId={editing.id} />
                    </>
                  )}
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create tag"}
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
        searchPlaceholder="Search tags..."
        searchColumn="name"
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Delete this tag?"
        description="This action cannot be undone. Tags still assigned to products can't be deleted."
        onConfirm={handleDelete}
      />
    </div>
  );
}
