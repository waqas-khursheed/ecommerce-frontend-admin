"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { attributeService, attributeItemService } from "@/services/attribute.service";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import type { Attribute, AttributeItem } from "@/types/attribute";

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [items, setItems] = useState<AttributeItem[]>([]);
  const [isLoadingAttributes, setIsLoadingAttributes] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  const [attrOpen, setAttrOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [deletingAttrId, setDeletingAttrId] = useState<number | null>(null);
  const [isSubmittingAttr, setIsSubmittingAttr] = useState(false);

  const [itemOpen, setItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttributeItem | null>(null);
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const loadAttributes = useCallback(async () => {
    try {
      const { items } = await attributeService.list({ limit: 100 });
      setAttributes(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load attributes"));
    } finally {
      setIsLoadingAttributes(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    try {
      const { items } = await attributeItemService.list({ limit: 100 });
      setItems(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load attribute items"));
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await attributeService.list({ limit: 100 });
        setAttributes(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load attributes"));
      } finally {
        setIsLoadingAttributes(false);
      }
    })();

    (async () => {
      try {
        const { items } = await attributeItemService.list({ limit: 100 });
        setItems(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load attribute items"));
      } finally {
        setIsLoadingItems(false);
      }
    })();
  }, []);

  const attributeTitleById = useMemo(
    () => new Map(attributes.map((a) => [a.id, a.attribute_title])),
    [attributes]
  );

  const attributeColumns = useMemo<ColumnDef<Attribute, unknown>[]>(
    () => [
      { accessorKey: "attribute_title", header: "Name" },
      {
        id: "items",
        header: "Items",
        cell: ({ row }) => items.filter((i) => i.attribute_id === row.original.id).length,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                setEditingAttr(row.original);
                setAttrOpen(true);
              }}
              onDelete={() => setDeletingAttrId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [items]
  );

  const itemColumns = useMemo<ColumnDef<AttributeItem, unknown>[]>(
    () => [
      { accessorKey: "attribute_id", header: "Attribute", cell: ({ getValue }) => attributeTitleById.get(getValue() as number) ?? "—" },
      {
        accessorKey: "title",
        header: "Value",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={uploadUrl("attributes", row.original.image) ?? undefined}
                alt=""
                className="size-6 rounded-full border object-cover"
              />
            )}
            {row.original.title}
          </div>
        ),
      },
      { accessorKey: "order_by", header: "Order" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                setEditingItem(row.original);
                setItemImageFile(null);
                setItemOpen(true);
              }}
              onDelete={() => setDeletingItemId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [attributeTitleById]
  );

  const handleAttrSubmit = async (formData: FormData) => {
    setIsSubmittingAttr(true);
    const attribute_title = String(formData.get("attribute_title") ?? "");

    try {
      if (editingAttr) {
        await attributeService.update(editingAttr.id, { attribute_title });
        toast.success(`"${attribute_title}" updated`);
      } else {
        await attributeService.create({ attribute_title });
        toast.success(`"${attribute_title}" created`);
      }
      setAttrOpen(false);
      setEditingAttr(null);
      await loadAttributes();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save attribute"));
    } finally {
      setIsSubmittingAttr(false);
    }
  };

  const handleAttrDelete = async () => {
    if (!deletingAttrId) return;
    const target = attributes.find((a) => a.id === deletingAttrId);

    try {
      await attributeService.remove(deletingAttrId);
      toast.success(`"${target?.attribute_title}" deleted`);
      await loadAttributes();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete attribute"));
    } finally {
      setDeletingAttrId(null);
    }
  };

  const handleItemSubmit = async (formData: FormData) => {
    setIsSubmittingItem(true);

    const payload = new FormData();
    payload.append("title", String(formData.get("title") ?? ""));
    payload.append("attribute_id", String(formData.get("attribute_id") ?? ""));
    payload.append("order_by", String(formData.get("order_by") ?? "0"));
    if (itemImageFile) payload.append("image", itemImageFile);

    try {
      if (editingItem) {
        await attributeItemService.update(editingItem.id, payload);
        toast.success("Attribute item updated");
      } else {
        await attributeItemService.create(payload);
        toast.success("Attribute item created");
      }
      setItemOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save attribute item"));
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleItemDelete = async () => {
    if (!deletingItemId) return;

    try {
      await attributeItemService.remove(deletingItemId);
      toast.success("Attribute item deleted");
      await loadItems();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete attribute item"));
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attributes"
        description="Define product attributes such as color, size and material."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attributes" }]}
      />

      <Tabs defaultValue="attributes">
        <TabsList>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="items">Attribute Items</TabsTrigger>
        </TabsList>

        <TabsContent value="attributes" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Sheet
              open={attrOpen}
              onOpenChange={(v) => {
                setAttrOpen(v);
                if (!v) setEditingAttr(null);
              }}
            >
              <SheetTrigger
                render={
                  <Button size="sm" onClick={() => setEditingAttr(null)}>
                    <Plus />
                    Add Attribute
                  </Button>
                }
              />
              <SheetContent>
                <form action={handleAttrSubmit} className="flex h-full flex-col">
                  <SheetHeader>
                    <SheetTitle>{editingAttr ? "Edit Attribute" : "Add Attribute"}</SheetTitle>
                    <SheetDescription>e.g. Color, Size, Fitting.</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 space-y-4 px-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="attribute_title">Name</Label>
                      <Input
                        id="attribute_title"
                        name="attribute_title"
                        defaultValue={editingAttr?.attribute_title}
                        required
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <Button type="submit" disabled={isSubmittingAttr}>
                      {isSubmittingAttr ? "Saving..." : editingAttr ? "Save changes" : "Create attribute"}
                    </Button>
                    <SheetClose render={<Button variant="outline">Cancel</Button>} />
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
          <DataTable
            columns={attributeColumns}
            data={attributes}
            isLoading={isLoadingAttributes}
            searchPlaceholder="Search attributes..."
            searchColumn="attribute_title"
          />
        </TabsContent>

        <TabsContent value="items" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Sheet
              open={itemOpen}
              onOpenChange={(v) => {
                setItemOpen(v);
                if (!v) setEditingItem(null);
              }}
            >
              <SheetTrigger
                render={
                  <Button
                    size="sm"
                    disabled={attributes.length === 0}
                    onClick={() => {
                      setEditingItem(null);
                      setItemImageFile(null);
                    }}
                  >
                    <Plus />
                    Add Item
                  </Button>
                }
              />
              <SheetContent>
                <form action={handleItemSubmit} className="flex h-full flex-col">
                  <SheetHeader>
                    <SheetTitle>{editingItem ? "Edit Attribute Item" : "Add Attribute Item"}</SheetTitle>
                    <SheetDescription>e.g. Red, Medium, Slim Fit.</SheetDescription>
                  </SheetHeader>
                  <div className="flex-1 space-y-4 px-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="attribute_id">Attribute</Label>
                      <Select name="attribute_id" defaultValue={String(editingItem?.attribute_id ?? attributes[0]?.id ?? "")}>
                        <SelectTrigger id="attribute_id" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {attributes.map((a) => (
                            <SelectItem key={a.id} value={String(a.id)}>
                              {a.attribute_title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="title">Value</Label>
                      <Input id="title" name="title" defaultValue={editingItem?.title} required />
                    </div>
                    <ImageUploadField
                      id="image"
                      label="Image (optional — e.g. a color swatch)"
                      existingImageUrl={uploadUrl("attributes", editingItem?.image)}
                      onFileChange={setItemImageFile}
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="order_by">Display order</Label>
                      <Input id="order_by" name="order_by" type="number" defaultValue={editingItem?.order_by ?? 0} />
                    </div>
                  </div>
                  <SheetFooter>
                    <Button type="submit" disabled={isSubmittingItem}>
                      {isSubmittingItem ? "Saving..." : editingItem ? "Save changes" : "Create item"}
                    </Button>
                    <SheetClose render={<Button variant="outline">Cancel</Button>} />
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          </div>
          <DataTable
            columns={itemColumns}
            data={items}
            isLoading={isLoadingItems}
            searchPlaceholder="Search items..."
            searchColumn="title"
          />
        </TabsContent>
      </Tabs>

      <ConfirmDeleteDialog
        open={deletingAttrId !== null}
        onOpenChange={(v) => !v && setDeletingAttrId(null)}
        title="Delete this attribute?"
        description="Attributes with existing items can't be deleted — remove its items first."
        onConfirm={handleAttrDelete}
      />
      <ConfirmDeleteDialog
        open={deletingItemId !== null}
        onOpenChange={(v) => !v && setDeletingItemId(null)}
        title="Delete this attribute item?"
        onConfirm={handleItemDelete}
      />
    </div>
  );
}
