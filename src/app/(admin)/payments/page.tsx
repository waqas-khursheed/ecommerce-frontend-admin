"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  banks,
  cardCategories,
  cardDetails,
  cardTypes,
  mobileCards,
  type BankRow,
  type CardTypeRow,
} from "@/lib/mock/payments";

export default function PaymentsPage() {
  const bankColumns = useMemo<ColumnDef<BankRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Bank" },
      { accessorKey: "accountName", header: "Account Name" },
      { accessorKey: "accountNumber", header: "Account Number" },
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
            <RowActions onEdit={() => toast.info(`Edit "${row.original.name}" (UI only)`)} />
          </div>
        ),
      },
    ],
    []
  );

  const categoryColumns = useMemo<ColumnDef<CardTypeRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
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
            <RowActions onEdit={() => toast.info(`Edit "${row.original.name}" (UI only)`)} />
          </div>
        ),
      },
    ],
    []
  );

  const typeColumns = useMemo<ColumnDef<CardTypeRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
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
            <RowActions onEdit={() => toast.info(`Edit "${row.original.name}" (UI only)`)} />
          </div>
        ),
      },
    ],
    []
  );

  const detailColumns = useMemo<ColumnDef<(typeof cardDetails)[number], unknown>[]>(
    () => [
      { accessorKey: "holder", header: "Cardholder" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "last4", header: "Last 4" },
      { accessorKey: "expiry", header: "Expiry" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
    ],
    []
  );

  const mobileColumns = useMemo<ColumnDef<(typeof mobileCards)[number], unknown>[]>(
    () => [
      { accessorKey: "provider", header: "Provider" },
      { accessorKey: "identifier", header: "Device" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Configure banks, cards and mobile payment providers."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Payments" }]}
      />

      <Tabs defaultValue="banks">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="banks">Banks</TabsTrigger>
          <TabsTrigger value="card-categories">Card Categories</TabsTrigger>
          <TabsTrigger value="card-types">Card Types</TabsTrigger>
          <TabsTrigger value="card-details">Card Details</TabsTrigger>
          <TabsTrigger value="mobile-cards">Mobile Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="banks" className="mt-4">
          <DataTable columns={bankColumns} data={banks} searchPlaceholder="Search banks..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="card-categories" className="mt-4">
          <DataTable columns={categoryColumns} data={cardCategories} searchPlaceholder="Search categories..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="card-types" className="mt-4">
          <DataTable columns={typeColumns} data={cardTypes} searchPlaceholder="Search types..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="card-details" className="mt-4">
          <DataTable columns={detailColumns} data={cardDetails} searchPlaceholder="Search cardholders..." searchColumn="holder" />
        </TabsContent>
        <TabsContent value="mobile-cards" className="mt-4">
          <DataTable columns={mobileColumns} data={mobileCards} searchPlaceholder="Search providers..." searchColumn="provider" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
