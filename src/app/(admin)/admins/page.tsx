"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/data-table/status-badge";
import { AvatarCell } from "@/components/data-table/avatar-cell";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { FieldError } from "@/components/ui/field-error";
import { adminAccountService } from "@/services/admin-account.service";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { createAdminSchema } from "@/lib/validations/admin-account.schema";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useAuthStore } from "@/store/auth.store";
import type { Admin } from "@/types/auth";

function AdminsTable() {
  const currentAdmin = useAuthStore((state) => state.admin);
  const {
    items: rows,
    setItems: setRows,
    isLoading,
    reload: loadAdmins,
    pagination,
    search,
    setSearch,
  } = usePaginatedList((params) => adminAccountService.list(params), {
    pageSize: 10,
    errorMessage: "Failed to load admins",
  });
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const openCreate = () => {
    setErrors({});
    setOpen(true);
  };

  const toggleStatus = async (id: number) => {
    try {
      const updated = await adminAccountService.toggleStatus(id);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: updated.is_active } : r)));
      toast.success(`Admin ${updated.is_active ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(createAdminSchema, {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await adminAccountService.create({
        ...data,
        is_admin: formData.get("is_admin") ? 1 : 0,
      });
      toast.success(`"${data.name}" added as an admin`);
      setOpen(false);
      await loadAdmins();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create admin"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await adminAccountService.remove(deletingId);
      toast.success("Admin removed");
      await loadAdmins();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to remove admin"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Admin, unknown>[]>(
    () => [
      {
        id: "name",
        header: "Admin",
        accessorFn: (row) => row.name,
        cell: ({ row }) => <AvatarCell name={row.original.name} subtitle={row.original.email} />,
      },
      {
        accessorKey: "is_admin",
        header: "Role",
        cell: ({ getValue }) =>
          getValue() === 1 ? (
            <Badge>Super Admin</Badge>
          ) : (
            <Badge variant="secondary">Staff</Badge>
          ),
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
              aria-label="Toggle admin status"
            />
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.id === currentAdmin?.id ? null : (
            <div className="flex justify-end">
              <RowActions onDelete={() => setDeletingId(row.original.id)} />
            </div>
          ),
      },
    ],
    [currentAdmin?.id]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Admins"
        description="Manage who can log into this admin panel."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admins" }]}
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button onClick={openCreate}><Plus />Add Admin</Button>} />
            <SheetContent>
              <form action={handleSubmit} className="flex h-full flex-col">
                <SheetHeader>
                  <SheetTitle>Add Admin</SheetTitle>
                  <SheetDescription>Create a new account that can log into this admin panel.</SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 px-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      aria-invalid={!!errors.name}
                      onChange={() => errors.name && setErrors((prev) => ({ ...prev, name: "" }))}
                    />
                    <FieldError message={errors.name} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      aria-invalid={!!errors.email}
                      onChange={() => errors.email && setErrors((prev) => ({ ...prev, email: "" }))}
                    />
                    <FieldError message={errors.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      aria-invalid={!!errors.password}
                      onChange={() => errors.password && setErrors((prev) => ({ ...prev, password: "" }))}
                    />
                    <FieldError message={errors.password} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox name="is_admin" />
                    Super admin (can manage other admin accounts)
                  </label>
                </div>
                <SheetFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create admin"}
                  </Button>
                  <SheetClose render={<Button variant="outline">Cancel</Button>} />
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        searchPlaceholder="Search admins..."
        searchColumn="name"
        serverSearch={{ value: search, onChange: setSearch }}
        pagination={pagination}
      />

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title="Remove this admin?"
        description="They will immediately lose access to this admin panel. This action cannot be undone."
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function AdminsPage() {
  const admin = useAuthStore((state) => state.admin);

  if (admin?.is_admin !== 1) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-24 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" />
        <p className="font-medium">Only super admins can manage admin accounts</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ask a super admin to grant you access, or to make the changes you need here.
        </p>
      </div>
    );
  }

  return <AdminsTable />;
}
