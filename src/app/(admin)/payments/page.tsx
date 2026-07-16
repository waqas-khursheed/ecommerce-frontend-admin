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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { validateForm, type FieldErrors } from "@/lib/validation";
import { bankSchema, cardCategorySchema, cardDetailSchema, cardTypeSchema } from "@/lib/validations/payment.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import {
  bankService,
  cardCategoryService,
  cardDetailService,
  cardTypeService,
  mobileCardService,
} from "@/services/payment.service";
import { countryService } from "@/services/location.service";
import type { PaginationMeta } from "@/types/api";
import type { Bank, CardCategory, CardDetail, CardType, MobileCard } from "@/types/payment";
import type { Country } from "@/types/location";
import type { z } from "zod";

interface LookupRow {
  id: number;
  status: 0 | 1;
  [key: string]: unknown;
}

interface LookupConfig {
  label: string;
  field: string;
  schema: z.ZodType<Record<string, string>>;
  service: {
    list: (params?: { page?: number; limit?: number }) => Promise<{ items: LookupRow[]; meta: PaginationMeta }>;
    create: (payload: Record<string, unknown>) => Promise<LookupRow>;
    update: (id: number, payload: Record<string, unknown>) => Promise<LookupRow>;
    remove: (id: number) => Promise<unknown>;
  };
}

function LookupTab({ config }: { config: LookupConfig }) {
  const { items: rows, isLoading, reload: load, pagination } = usePaginatedList(
    (params) => config.service.list(params),
    { pageSize: 10, errorMessage: `Failed to load ${config.label.toLowerCase()}` }
  );
  const [editing, setEditing] = useState<LookupRow | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(config.schema, {
      [config.field]: String(formData.get(config.field) ?? ""),
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const payload = {
      ...data,
      status: formData.get("status") ? 1 : 0,
    };
    try {
      if (editing) {
        await config.service.update(editing.id, payload);
        toast.success(`${config.label} updated`);
      } else {
        await config.service.create(payload);
        toast.success(`${config.label} created`);
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Failed to save ${config.label.toLowerCase()}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await config.service.remove(deletingId);
      toast.success(`${config.label} deleted`);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Failed to delete ${config.label.toLowerCase()}`));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<LookupRow, unknown>[]>(
    () => [
      { accessorKey: config.field, header: "Name" },
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
              onEdit={() => { setEditing(row.original); setErrors({}); setOpen(true); }}
              onDelete={() => setDeletingId(row.original.id)}
            />
          </div>
        ),
      },
    ],
    [config.field]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <SheetTrigger render={<Button size="sm" onClick={() => { setEditing(null); setErrors({}); }}><Plus />Add {config.label}</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? `Edit ${config.label}` : `Add ${config.label}`}</SheetTitle>
                <SheetDescription>{config.label} used for offline/manual payment metadata.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor={config.field}>Name</Label>
                  <Input
                    id={config.field}
                    name={config.field}
                    defaultValue={editing?.[config.field] as string}
                    aria-invalid={!!errors[config.field]}
                    onChange={() => errors[config.field] && setErrors((prev) => ({ ...prev, [config.field]: "" }))}
                  />
                  <FieldError message={errors[config.field]} />
                </div>
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder={`Search ${config.label.toLowerCase()}...`} searchColumn={config.field} pagination={pagination} />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title={`Delete this ${config.label.toLowerCase()}?`} onConfirm={handleDelete} />
    </div>
  );
}

function CardDetailsTab() {
  const { items: rows, isLoading, reload: load, pagination } = usePaginatedList(
    (params) => cardDetailService.list(params),
    { pageSize: 10, errorMessage: "Failed to load card details" }
  );
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<CardCategory[]>([]);
  const [types, setTypes] = useState<CardType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [editing, setEditing] = useState<CardDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    (async () => {
      try {
        const [bankRes, categoryRes, typeRes, countryRes] = await Promise.all([
          bankService.list({ limit: 200 }),
          cardCategoryService.list({ limit: 200 }),
          cardTypeService.list({ limit: 200 }),
          countryService.list({ limit: 200 }),
        ]);
        setBanks(bankRes.items);
        setCategories(categoryRes.items);
        setTypes(typeRes.items);
        setCountries(countryRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load card detail form data"));
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    const { data, errors: validationErrors } = validateForm(cardDetailSchema, {
      card_no: String(formData.get("card_no") ?? ""),
      country_id: String(formData.get("country_id") ?? ""),
      card_category_id: String(formData.get("card_category_id") ?? ""),
      card_type_id: String(formData.get("card_type_id") ?? ""),
      bank_id: String(formData.get("bank_id") ?? ""),
      percentage: String(formData.get("percentage") ?? ""),
    });
    if (!data) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const payload = { ...data, status: (formData.get("status") ? 1 : 0) as 0 | 1 };
    try {
      if (editing) {
        await cardDetailService.update(editing.id, payload);
        toast.success("Card detail updated");
      } else {
        await cardDetailService.create(payload);
        toast.success("Card detail created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save card detail"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await cardDetailService.remove(deletingId);
      toast.success("Card detail deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete card detail"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<CardDetail, unknown>[]>(
    () => [
      { accessorKey: "card_no", header: "BIN / Card No" },
      { id: "bank", header: "Bank", accessorFn: (row) => row.bank?.bank_title ?? `#${row.bank_id}` },
      { id: "category", header: "Category", accessorFn: (row) => row.cardCategory?.card_category ?? `#${row.card_category_id}` },
      { id: "type", header: "Type", accessorFn: (row) => row.cardType?.card_type ?? `#${row.card_type_id}` },
      { accessorKey: "percentage", header: "Discount %" },
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
              onEdit={() => { setEditing(row.original); setErrors({}); setOpen(true); }}
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
          <SheetTrigger render={<Button size="sm" onClick={() => { setEditing(null); setErrors({}); }}><Plus />Add Card Detail</Button>} />
          <SheetContent className="overflow-y-auto">
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Card Detail" : "Add Card Detail"}</SheetTitle>
                <SheetDescription>A BIN/card discount rule.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="card_no">Card number (BIN)</Label>
                  <Input
                    id="card_no"
                    name="card_no"
                    type="number"
                    defaultValue={editing?.card_no}
                    aria-invalid={!!errors.card_no}
                    onChange={() => errors.card_no && setErrors((prev) => ({ ...prev, card_no: "" }))}
                  />
                  <FieldError message={errors.card_no} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank_id">Bank</Label>
                  <Select
                    name="bank_id"
                    defaultValue={editing?.bank_id ? String(editing.bank_id) : undefined}
                    onValueChange={() => errors.bank_id && setErrors((prev) => ({ ...prev, bank_id: "" }))}
                  >
                    <SelectTrigger id="bank_id" className="w-full" aria-invalid={!!errors.bank_id}><SelectValue placeholder="Select bank" /></SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.bank_title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.bank_id} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card_category_id">Card Category</Label>
                  <Select
                    name="card_category_id"
                    defaultValue={editing?.card_category_id ? String(editing.card_category_id) : undefined}
                    onValueChange={() => errors.card_category_id && setErrors((prev) => ({ ...prev, card_category_id: "" }))}
                  >
                    <SelectTrigger id="card_category_id" className="w-full" aria-invalid={!!errors.card_category_id}><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.card_category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.card_category_id} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card_type_id">Card Type</Label>
                  <Select
                    name="card_type_id"
                    defaultValue={editing?.card_type_id ? String(editing.card_type_id) : undefined}
                    onValueChange={() => errors.card_type_id && setErrors((prev) => ({ ...prev, card_type_id: "" }))}
                  >
                    <SelectTrigger id="card_type_id" className="w-full" aria-invalid={!!errors.card_type_id}><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.card_type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.card_type_id} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country_id">Country</Label>
                  <Select
                    name="country_id"
                    defaultValue={editing?.country_id ? String(editing.country_id) : undefined}
                    onValueChange={() => errors.country_id && setErrors((prev) => ({ ...prev, country_id: "" }))}
                  >
                    <SelectTrigger id="country_id" className="w-full" aria-invalid={!!errors.country_id}><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.country_id} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="percentage">Discount %</Label>
                  <Input
                    id="percentage"
                    name="percentage"
                    type="number"
                    step="0.01"
                    max={100}
                    defaultValue={editing?.percentage}
                    aria-invalid={!!errors.percentage}
                    onChange={() => errors.percentage && setErrors((prev) => ({ ...prev, percentage: "" }))}
                  />
                  <FieldError message={errors.percentage} />
                </div>
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search card details..." pagination={pagination} />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this card detail?" onConfirm={handleDelete} />
    </div>
  );
}

function MobileCardsTab() {
  const { items: rows, isLoading, reload: load, pagination } = usePaginatedList(
    (params) => mobileCardService.list(params),
    { pageSize: 10, errorMessage: "Failed to load mobile cards" }
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await mobileCardService.remove(deletingId);
      toast.success("Mobile card entry deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete entry"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<MobileCard, unknown>[]>(
    () => [
      { accessorKey: "card_no", header: "Card No" },
      { accessorKey: "device_id", header: "Device" },
      { accessorKey: "percentage", header: "Discount %" },
      {
        accessorKey: "created_at",
        header: "Recorded",
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
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
      <p className="text-sm text-muted-foreground">
        Read-only usage log — mobile card entries are written by the mobile app flow, not created here.
      </p>
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search device IDs..." searchColumn="device_id" pagination={pagination} />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this entry?" onConfirm={handleDelete} />
    </div>
  );
}

export default function PaymentsPage() {
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
          <LookupTab config={{ label: "Bank", field: "bank_title", schema: bankSchema, service: bankService as unknown as LookupConfig["service"] }} />
        </TabsContent>
        <TabsContent value="card-categories" className="mt-4">
          <LookupTab config={{ label: "Card Category", field: "card_category", schema: cardCategorySchema, service: cardCategoryService as unknown as LookupConfig["service"] }} />
        </TabsContent>
        <TabsContent value="card-types" className="mt-4">
          <LookupTab config={{ label: "Card Type", field: "card_type", schema: cardTypeSchema, service: cardTypeService as unknown as LookupConfig["service"] }} />
        </TabsContent>
        <TabsContent value="card-details" className="mt-4">
          <CardDetailsTab />
        </TabsContent>
        <TabsContent value="mobile-cards" className="mt-4">
          <MobileCardsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
