"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { AvatarCell } from "@/components/data-table/avatar-cell";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/user.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { Customer } from "@/types/customer";

function CustomersPageContent() {
  // Seeds the search box with ?search= from the header quick-search
  // (components/layout/header-search.tsx) so the target customer is visible
  // immediately, on top of usePaginatedList — search — genuinely filtering
  // the whole list server-side (not just whatever page happens to be
  // loaded).
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const {
    items: rows,
    setItems: setRows,
    isLoading,
    reload: loadCustomers,
    pagination,
    search,
    setSearch,
  } = usePaginatedList((params) => userService.list(params), {
    pageSize: 10,
    errorMessage: "Failed to load customers",
    initialSearch,
  });
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const toggleStatus = async (id: number) => {
    try {
      const updated = await userService.toggleStatus(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: updated.is_active } : r)));
      toast.success(`Customer ${updated.is_active ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  };

  const openCustomer = async (id: number) => {
    setOpen(true);
    setViewing(null);
    try {
      const customer = await userService.getById(id);
      setViewing(customer);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load customer"));
      setOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await userService.remove(deletingId);
      toast.success("Customer removed");
      await loadCustomers();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove customer"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Customer",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        cell: ({ row }) => (
          <AvatarCell name={`${row.original.first_name} ${row.original.last_name}`} subtitle={row.original.email} />
        ),
      },
      { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => (getValue() as string) || "—" },
      { accessorKey: "type", header: "Type", cell: ({ getValue }) => (getValue() as string) || "—" },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.is_active ? "Active" : "Inactive"} />
            <Switch
              checked={!!row.original.is_active}
              onCheckedChange={() => toggleStatus(row.original.id)}
              aria-label="Toggle customer status"
            />
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button variant="ghost" size="icon" className="size-8" aria-label="View customer" onClick={() => openCustomer(row.original.id)}>
              <Eye className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="View and manage registered storefront customers."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Customers" }]}
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search customers..."
        searchColumn="name"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
      />

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setViewing(null); }}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{viewing ? `${viewing.first_name} ${viewing.last_name}` : "Loading..."}</SheetTitle>
            <SheetDescription>Customer profile and saved addresses.</SheetDescription>
          </SheetHeader>

          {viewing && (
            <div className="flex-1 space-y-4 px-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Email: {viewing.email}</p>
                <p className="text-muted-foreground">Phone: {viewing.phone ?? "—"}</p>
                <p className="text-muted-foreground">Company: {viewing.company_name ?? "—"}</p>
                <p className="text-muted-foreground">
                  Joined: {new Date(viewing.created_at).toLocaleDateString()}
                </p>
              </div>

              {!!viewing.userAddresses?.length && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="font-medium">Addresses</p>
                    {viewing.userAddresses.map((addr) => (
                      <div key={addr.id} className="rounded-md border p-2 text-muted-foreground">
                        {addr.address1 && <p>{addr.address1}</p>}
                        {addr.address2 && <p>{addr.address2}</p>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator />
              <Button
                variant="destructive"
                onClick={() => {
                  setDeletingId(viewing.id);
                  setOpen(false);
                }}
              >
                Remove customer
              </Button>
            </div>
          )}

          <SheetFooter>
            <SheetClose render={<Button variant="outline">Close</Button>} />
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Remove this customer?"
        description="This permanently deletes the customer account. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersPageContent />
    </Suspense>
  );
}
