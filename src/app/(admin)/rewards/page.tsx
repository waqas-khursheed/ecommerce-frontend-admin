"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  rewardSettings,
  rewardsEarningMethods,
  userRewards,
  type EarningMethodRow,
  type UserRewardRow,
} from "@/lib/mock/engagement";

export default function RewardsPage() {
  const [methods, setMethods] = useState<EarningMethodRow[]>(rewardsEarningMethods);

  const methodColumns = useMemo<ColumnDef<EarningMethodRow, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Method" },
      { accessorKey: "points", header: "Points" },
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
              onDelete={() => setMethods((prev) => prev.filter((m) => m.id !== row.original.id))}
            />
          </div>
        ),
      },
    ],
    []
  );

  const rewardColumns = useMemo<ColumnDef<UserRewardRow, unknown>[]>(
    () => [
      { accessorKey: "customer", header: "Customer" },
      { accessorKey: "points", header: "Points" },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ getValue }) => <Badge variant="outline">{getValue() as string}</Badge>,
      },
      { accessorKey: "lastEarned", header: "Last Earned" },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rewards"
        description="Configure the loyalty and rewards program."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rewards" }]}
      />

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="methods">Earning Methods</TabsTrigger>
          <TabsTrigger value="users">User Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>Configure how points are earned and redeemed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pointsPerCurrency">Points per $1 spent</Label>
                  <Input id="pointsPerCurrency" type="number" defaultValue={rewardSettings.pointsPerCurrency} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currencyPerPoint">Points needed for $1 off</Label>
                  <Input id="currencyPerPoint" type="number" defaultValue={rewardSettings.currencyPerPoint} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="minRedeemPoints">Minimum points to redeem</Label>
                  <Input id="minRedeemPoints" type="number" defaultValue={rewardSettings.minRedeemPoints} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiryMonths">Points expiry (months)</Label>
                  <Input id="expiryMonths" type="number" defaultValue={rewardSettings.expiryMonths} />
                </div>
              </div>
              <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="mt-4">
          <DataTable columns={methodColumns} data={methods} searchPlaceholder="Search methods..." searchColumn="name" />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <DataTable columns={rewardColumns} data={userRewards} searchPlaceholder="Search customers..." searchColumn="customer" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
