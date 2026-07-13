"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  cmsPages as initialPages,
  contactUsPage,
  faqCategories as initialFaqCategories,
  faqs as initialFaqs,
  type CmsPageRow,
  type FaqCategoryRow,
  type FaqRow,
} from "@/lib/mock/content";

export default function CmsPage() {
  const [faqCategories, setFaqCategories] = useState<FaqCategoryRow[]>(initialFaqCategories);
  const [faqs, setFaqs] = useState<FaqRow[]>(initialFaqs);
  const [pages, setPages] = useState<CmsPageRow[]>(initialPages);

  const faqCategoryColumns = useMemo<ColumnDef<FaqCategoryRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Category" },
      { accessorKey: "faqs", header: "FAQs" },
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
              onEdit={() => toast.info(`Edit "${row.original.name}" (UI only)`)}
              onDelete={() => setFaqCategories((prev) => prev.filter((r) => r.id !== row.original.id))}
            />
          </div>
        ),
      },
    ],
    []
  );

  const faqColumns = useMemo<ColumnDef<FaqRow, unknown>[]>(
    () => [
      { accessorKey: "question", header: "Question" },
      { accessorKey: "category", header: "Category" },
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
              onEdit={() => toast.info(`Edit "${row.original.question}" (UI only)`)}
              onDelete={() => setFaqs((prev) => prev.filter((r) => r.id !== row.original.id))}
            />
          </div>
        ),
      },
    ],
    []
  );

  const pageColumns = useMemo<ColumnDef<CmsPageRow, unknown>[]>(
    () => [
      { accessorKey: "title", header: "Title" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
      { accessorKey: "updated", header: "Updated" },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => toast.info(`Edit "${row.original.title}" (UI only)`)}
              onDelete={() => setPages((prev) => prev.filter((r) => r.id !== row.original.id))}
            />
          </div>
        ),
      },
    ],
    []
  );

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

        <TabsContent value="faq-categories" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.info("UI only, not wired up yet")}>
              <Plus />
              Add Category
            </Button>
          </div>
          <DataTable columns={faqCategoryColumns} data={faqCategories} searchPlaceholder="Search categories..." searchColumn="name" />
        </TabsContent>

        <TabsContent value="faqs" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.info("UI only, not wired up yet")}>
              <Plus />
              Add FAQ
            </Button>
          </div>
          <DataTable columns={faqColumns} data={faqs} searchPlaceholder="Search FAQs..." searchColumn="question" />
        </TabsContent>

        <TabsContent value="pages" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => toast.info("UI only, not wired up yet")}>
              <Plus />
              Add Page
            </Button>
          </div>
          <DataTable columns={pageColumns} data={pages} searchPlaceholder="Search pages..." searchColumn="title" />
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Contact Us Page</CardTitle>
              <CardDescription>Shown on the storefront&apos;s contact page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">Support email</Label>
                <Input id="contact-email" defaultValue={contactUsPage.email} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input id="contact-phone" defaultValue={contactUsPage.phone} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-address">Address</Label>
                <Textarea id="contact-address" defaultValue={contactUsPage.address} rows={3} />
              </div>
              <Button onClick={() => toast.success("Contact page saved")}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
