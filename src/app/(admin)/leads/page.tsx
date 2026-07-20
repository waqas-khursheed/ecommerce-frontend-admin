"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/apiError";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { queryFormService, subscriberService } from "@/services/lead.service";
import type { QueryForm, Subscriber } from "@/types/lead";

function QueryFormsTab() {
  const { items: rows, setItems: setRows, isLoading, reload: load, pagination, search, setSearch } = usePaginatedList(
    (params) => queryFormService.list(params),
    { pageSize: 10, errorMessage: "Failed to load messages" }
  );
  const [viewing, setViewing] = useState<QueryForm | null>(null);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openMessage = async (row: QueryForm) => {
    setViewing(row);
    setOpen(true);
    if (!row.seen) {
      try {
        await queryFormService.markSeen(row.id);
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, seen: 1 } : r)));
      } catch {
        // non-fatal — the message still opens even if marking seen failed
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await queryFormService.remove(deletingId);
      toast.success("Message deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete message"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<QueryForm, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone", cell: ({ getValue }) => (getValue() as string) || "—" },
      {
        accessorKey: "created_at",
        header: "Date",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "seen",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue() ? "Read" : "Pending"} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8" aria-label="View message" onClick={() => openMessage(row.original)}>
              <Eye className="size-4" />
            </Button>
            <RowActions onDelete={() => setDeletingId(row.original.id)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search messages..." searchColumn="name" serverSearch={{ value: search, onChange: setSearch }} pagination={pagination} />

      <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setViewing(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{viewing?.name}</SheetTitle>
            <SheetDescription>{viewing?.email} {viewing?.phone ? `· ${viewing.phone}` : ""}</SheetDescription>
          </SheetHeader>
          {viewing && (
            <div className="flex-1 px-4 text-sm text-muted-foreground whitespace-pre-wrap">
              {viewing.description}
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
        title="Delete this message?"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SubscribersTab() {
  const { items: rows, setItems: setRows, isLoading, reload: load, pagination, search, setSearch } = usePaginatedList(
    (params) => subscriberService.list(params),
    { pageSize: 10, errorMessage: "Failed to load subscribers" }
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const toggleStatus = async (id: number) => {
    try {
      const updated = await subscriberService.toggleStatus(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status, seen: 1 } : r)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await subscriberService.remove(deletingId);
      toast.success("Subscriber removed");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove subscriber"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Subscriber, unknown>[]>(
    () => [
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "created_at",
        header: "Subscribed On",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusBadge status={row.original.status ? "Active" : "Inactive"} />
            <Switch checked={!!row.original.status} onCheckedChange={() => toggleStatus(row.original.id)} />
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions onDelete={() => setDeletingId(row.original.id)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search subscribers..." searchColumn="email" serverSearch={{ value: search, onChange: setSearch }} pagination={pagination} />
      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Remove this subscriber?"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function LeadsPage() {
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
          <QueryFormsTab />
        </TabsContent>
        <TabsContent value="subscribers" className="mt-4">
          <SubscribersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
