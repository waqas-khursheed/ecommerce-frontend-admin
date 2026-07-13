"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  cities,
  countries,
  geoZones,
  productCityAssignments,
  states,
  type LocationRow,
} from "@/lib/mock/locations";

function useLocationColumns(showParent: boolean) {
  return useMemo<ColumnDef<LocationRow, unknown>[]>(() => {
    const cols: ColumnDef<LocationRow, unknown>[] = [{ accessorKey: "name", header: "Name" }];
    if (showParent) cols.push({ accessorKey: "parent", header: "Parent" });
    cols.push({
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    });
    cols.push({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowActions onEdit={() => toast.info(`Edit "${row.original.name}" (UI only)`)} />
        </div>
      ),
    });
    return cols;
  }, [showParent]);
}

export default function LocationsPage() {
  const countryColumns = useLocationColumns(false);
  const stateColumns = useLocationColumns(true);
  const cityColumns = useLocationColumns(true);
  const zoneColumns = useLocationColumns(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Locations"
        description="Manage countries, states, cities and delivery zones."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Locations" }]}
      />

      <Tabs defaultValue="countries">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="zones">Geo Zones</TabsTrigger>
          <TabsTrigger value="product-city">Product Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="countries" className="mt-4">
          <DataTable columns={countryColumns} data={countries} searchPlaceholder="Search countries..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="states" className="mt-4">
          <DataTable columns={stateColumns} data={states} searchPlaceholder="Search states..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="cities" className="mt-4">
          <DataTable columns={cityColumns} data={cities} searchPlaceholder="Search cities..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="zones" className="mt-4">
          <DataTable columns={zoneColumns} data={geoZones} searchPlaceholder="Search zones..." searchColumn="name" />
        </TabsContent>
        <TabsContent value="product-city" className="mt-4 space-y-3">
          {productCityAssignments.map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{row.product}</p>
                <p className="text-xs text-muted-foreground">{row.city}</p>
              </div>
              <Badge variant={row.available ? "secondary" : "outline"}>
                {row.available ? "Available" : "Unavailable"}
              </Badge>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
