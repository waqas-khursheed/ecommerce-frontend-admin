"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getApiErrorMessage } from "@/lib/apiError";
import { uploadUrl } from "@/lib/http";
import { commonPageService, contactUsPageService, faqCategoryService, faqService } from "@/services/cms.service";
import type { CommonPage, ContactUsPage, Faq, FaqCategory } from "@/types/cms";

function FaqCategoriesTab() {
  const [rows, setRows] = useState<FaqCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<FaqCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await faqCategoryService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load FAQ categories"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await faqCategoryService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load FAQ categories"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = { title: String(formData.get("title") ?? "") };
    try {
      if (editing) {
        await faqCategoryService.update(editing.id, payload);
        toast.success("Category updated");
      } else {
        await faqCategoryService.create(payload);
        toast.success("Category created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await faqCategoryService.remove(deletingId);
      toast.success("Category deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete category"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<FaqCategory, unknown>[]>(
    () => [
      { accessorKey: "title", header: "Category" },
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
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add Category</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Category" : "Add Category"}</SheetTitle>
                <SheetDescription>FAQ categories group related questions together.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editing?.title} required />
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
                <SheetClose render={<Button variant="outline">Cancel</Button>} />
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search categories..." searchColumn="title" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this category?" onConfirm={handleDelete} />
    </div>
  );
}

function FaqsTab() {
  const [rows, setRows] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await faqService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load FAQs"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [faqRes, categoryRes] = await Promise.all([
          faqService.list({ limit: 100 }),
          faqCategoryService.list({ limit: 100 }),
        ]);
        setRows(faqRes.items);
        setCategories(categoryRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load FAQs"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      question: String(formData.get("question") ?? ""),
      answer: String(formData.get("answer") ?? ""),
      category_id: Number(formData.get("category_id") ?? 0),
    };
    try {
      if (editing) {
        await faqService.update(editing.id, payload);
        toast.success("FAQ updated");
      } else {
        await faqService.create(payload);
        toast.success("FAQ created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save FAQ"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await faqService.remove(deletingId);
      toast.success("FAQ deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete FAQ"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Faq, unknown>[]>(
    () => [
      { accessorKey: "question", header: "Question" },
      { id: "category", header: "Category", accessorFn: (row) => row.category?.title ?? `#${row.category_id}` },
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
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add FAQ</Button>} />
          <SheetContent className="overflow-y-auto">
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit FAQ" : "Add FAQ"}</SheetTitle>
                <SheetDescription>Answer a common customer question.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="question">Question</Label>
                  <Input id="question" name="question" defaultValue={editing?.question} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea id="answer" name="answer" rows={4} defaultValue={editing?.answer} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="category_id">Category</Label>
                  <Select name="category_id" defaultValue={editing?.category_id ? String(editing.category_id) : undefined}>
                    <SelectTrigger id="category_id" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
                <SheetClose render={<Button variant="outline">Cancel</Button>} />
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search FAQs..." searchColumn="question" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this FAQ?" onConfirm={handleDelete} />
    </div>
  );
}

function PagesTab() {
  const [rows, setRows] = useState<CommonPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<CommonPage | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await commonPageService.list({ limit: 100 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load pages"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await commonPageService.list({ limit: 100 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load pages"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("title", String(formData.get("title") ?? ""));
    payload.append("heading", String(formData.get("heading") ?? ""));
    payload.append("content", String(formData.get("content") ?? ""));
    payload.append("page_name", String(formData.get("page_name") ?? "").toLowerCase());
    payload.append("status", formData.get("status") ? "1" : "0");
    if (imageFile) payload.append("image", imageFile);

    try {
      if (editing) {
        await commonPageService.update(editing.id, payload);
        toast.success("Page updated");
      } else {
        await commonPageService.create(payload);
        toast.success("Page created");
      }
      setOpen(false);
      setEditing(null);
      setImageFile(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save page"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await commonPageService.remove(deletingId);
      toast.success("Page deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete page"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<CommonPage, unknown>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "slug", header: "Slug" },
      { accessorKey: "page_name", header: "Page Name" },
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setImageFile(null); } }}>
          <SheetTrigger render={<Button size="sm" onClick={() => { setEditing(null); setImageFile(null); }}><Plus />Add Page</Button>} />
          <SheetContent className="overflow-y-auto">
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Page" : "Add Page"}</SheetTitle>
                <SheetDescription>A static content page (About Us, Terms, etc.)</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editing?.title} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="page_name">Page name (unique key)</Label>
                  <Input id="page_name" name="page_name" defaultValue={editing?.page_name} placeholder="about-us" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heading">Heading</Label>
                  <Input id="heading" name="heading" defaultValue={editing?.heading ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" name="content" rows={6} defaultValue={editing?.content} required />
                </div>
                <ImageUploadField
                  id="image"
                  label="Cover Image"
                  existingImageUrl={uploadUrl("cms", editing?.image ?? undefined)}
                  onFileChange={setImageFile}
                />
                <div className="flex items-center gap-2">
                  <Checkbox id="status" name="status" defaultChecked={(editing?.status ?? 1) === 1} />
                  <Label htmlFor="status">Active</Label>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
                <SheetClose render={<Button variant="outline">Cancel</Button>} />
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search pages..." searchColumn="title" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this page?" onConfirm={handleDelete} />
    </div>
  );
}

function ContactUsTab() {
  const [data, setData] = useState<ContactUsPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await contactUsPageService.get();
        setData(result);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load contact page"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const updated = await contactUsPageService.update({
        title: String(formData.get("title") ?? ""),
        content: String(formData.get("content") ?? ""),
        map: String(formData.get("map") ?? ""),
        status: 1,
      });
      setData(updated);
      toast.success("Contact page saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save contact page"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Contact Us Page</CardTitle>
        <CardDescription>Shown on the storefront&apos;s contact page.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={data?.title} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="content">Content</Label>
            <Textarea id="content" name="content" rows={4} defaultValue={data?.content} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="map">Map embed URL</Label>
            <Input id="map" name="map" defaultValue={data?.map ?? ""} />
          </div>
          <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CmsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="CMS Pages"
        description="Manage FAQs, static pages, and contact information."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "CMS Pages" }]}
      />

      <Tabs defaultValue="faq-categories">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="faq-categories">FAQ Categories</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="contact">Contact Us Page</TabsTrigger>
        </TabsList>

        <TabsContent value="faq-categories" className="mt-4">
          <FaqCategoriesTab />
        </TabsContent>
        <TabsContent value="faqs" className="mt-4">
          <FaqsTab />
        </TabsContent>
        <TabsContent value="pages" className="mt-4">
          <PagesTab />
        </TabsContent>
        <TabsContent value="contact" className="mt-4">
          <ContactUsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
