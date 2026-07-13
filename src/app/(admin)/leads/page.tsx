"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  queryForms as initialQueryForms,
  subscribers as initialSubscribers,
  type QueryFormRow,
  type SubscriberRow,
} from "@/lib/mock/engagement";

export default function LeadsPage() {
  const [queryForms, setQueryForms] = useState<QueryFormRow[]>(initialQueryForms);
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>(initialSubscribers);

  const queryColumns = useMemo<ColumnDef<QueryFormRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "subject", header: "Subject" },
      { accessorKey: "date", header: "Date" },
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
              onView={() => toast.info(`Viewing message from ${row.original.name} (UI only)`)}
              onDelete={() => setQueryForms((prev) => prev.filter((r) => r.id !== row.original.id))}
            />
          </div>
        ),
      },
    ],
    []
  );

  const subscriberColumns = useMemo<ColumnDef<SubscriberRow, unknown>[]>(
    () => [
      { accessorKey: "email", header: "Email" },
      { accessorKey: "subscribed", header: "Subscribed On" },
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
              onDelete={() => setSubscribers((prev) => prev.filter((r) => r.id !== row.original.id))}
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
        title="Leads"
        description="Contact form submissions and newsletter subscribers."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Leads" }]}
      />

      <Tabs defaultValue="queries">
        <TabsList>
          <TabsTrigger value="queries">Query Forms</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
        </TabsList>
        <TabsContent value="queries" className="mt-4">
          <DataTable columns={queryColumns} data={queryForms} searchPlaceholder="Search messages..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="subscribers" className="mt-4">
          <DataTable columns={subscriberColumns} data={subscribers} searchPlaceholder="Search subscribers..." searchColumn="email" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
