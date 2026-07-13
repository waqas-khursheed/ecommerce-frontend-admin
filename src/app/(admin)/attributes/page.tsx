"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  attributeItems as initialItems,
  attributes as initialAttributes,
  type AttributeRow,
} from "@/lib/mock/catalog";

interface AttributeItemRow {
  id: number;
  attribute: string;
  value: string;
  swatch: string | null;
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<AttributeRow[]>(initialAttributes);
  const [items] = useState<AttributeItemRow[]>(initialItems);

  const attributeColumns = useMemo<ColumnDef<AttributeRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "items", header: "Items" },
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
              onEdit={() => toast.info(`Edit "${row.original.name}" (UI only, not wired up yet)`)}
              onDelete={() => {
                setAttributes((prev) => prev.filter((r) => r.id !== row.original.id));
                toast.success(`"${row.original.name}" deleted`);
              }}
            />
          </div>
        ),
      },
    ],
    []
  );

  const itemColumns = useMemo<ColumnDef<AttributeItemRow, unknown>[]>(
    () => [
      { accessorKey: "attribute", header: "Attribute" },
      {
        accessorKey: "value",
        header: "Value",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.swatch && (
              <span
                className="size-4 rounded-full border"
                style={{ backgroundColor: row.original.swatch }}
              />
            )}
            {row.original.value}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <div className="flex justify-end">
            <RowActions onEdit={() => toast.info("UI only, not wired up yet")} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Attributes"
        description="Define product attributes such as color, size and material."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attributes" }]}
        actions={
          <Button onClick={() => toast.info("UI only, not wired up yet")}>
            <Plus />
            Add Attribute
          </Button>
        }
      />

      <Tabs defaultValue="attributes">
        <TabsList>
          <TabsTrigger value="attributes">Attributes</TabsTrigger>
          <TabsTrigger value="items">Attribute Items</TabsTrigger>
        </TabsList>
        <TabsContent value="attributes" className="mt-4">
          <DataTable columns={attributeColumns} data={attributes} searchPlaceholder="Search attributes..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="items" className="mt-4">
          <DataTable columns={itemColumns} data={items} searchPlaceholder="Search items..." searchColumn="value" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
