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
import {
  bankService,
  cardCategoryService,
  cardDetailService,
  cardTypeService,
  mobileCardService,
} from "@/services/payment.service";
import { countryService } from "@/services/location.service";
import type { Bank, CardCategory, CardDetail, CardType, MobileCard } from "@/types/payment";
import type { Country } from "@/types/location";

interface LookupRow {
  id: number;
  status: 0 | 1;
  [key: string]: unknown;
}

interface LookupConfig {
  label: string;
  field: string;
  service: {
    list: (params?: { limit: number }) => Promise<{ items: LookupRow[] }>;
    create: (payload: Record<string, unknown>) => Promise<LookupRow>;
    update: (id: number, payload: Record<string, unknown>) => Promise<LookupRow>;
    remove: (id: number) => Promise<unknown>;
  };
}

function LookupTab({ config }: { config: LookupConfig }) {
  const [rows, setRows] = useState<LookupRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<LookupRow | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await config.service.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Failed to load ${config.label.toLowerCase()}`));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await config.service.list({ limit: 200 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, `Failed to load ${config.label.toLowerCase()}`));
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.field]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      [config.field]: String(formData.get(config.field) ?? ""),
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
              onEdit={() => { setEditing(row.original); setOpen(true); }}
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
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add {config.label}</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? `Edit ${config.label}` : `Add ${config.label}`}</SheetTitle>
                <SheetDescription>{config.label} used for offline/manual payment metadata.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor={config.field}>Name</Label>
                  <Input id={config.field} name={config.field} defaultValue={editing?.[config.field] as string} required />
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder={`Search ${config.label.toLowerCase()}...`} searchColumn={config.field} />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title={`Delete this ${config.label.toLowerCase()}?`} onConfirm={handleDelete} />
    </div>
  );
}

function CardDetailsTab() {
  const [rows, setRows] = useState<CardDetail[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<CardCategory[]>([]);
  const [types, setTypes] = useState<CardType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<CardDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await cardDetailService.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load card details"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [detailRes, bankRes, categoryRes, typeRes, countryRes] = await Promise.all([
          cardDetailService.list({ limit: 200 }),
          bankService.list({ limit: 200 }),
          cardCategoryService.list({ limit: 200 }),
          cardTypeService.list({ limit: 200 }),
          countryService.list({ limit: 200 }),
        ]);
        setRows(detailRes.items);
        setBanks(bankRes.items);
        setCategories(categoryRes.items);
        setTypes(typeRes.items);
        setCountries(countryRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load card details"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      card_no: Number(formData.get("card_no") ?? 0),
      country_id: Number(formData.get("country_id") ?? 0),
      card_category_id: Number(formData.get("card_category_id") ?? 0),
      card_type_id: Number(formData.get("card_type_id") ?? 0),
      bank_id: Number(formData.get("bank_id") ?? 0),
      percentage: Number(formData.get("percentage") ?? 0),
      status: (formData.get("status") ? 1 : 0) as 0 | 1,
    };
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
              onEdit={() => { setEditing(row.original); setOpen(true); }}
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
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add Card Detail</Button>} />
          <SheetContent className="overflow-y-auto">
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Card Detail" : "Add Card Detail"}</SheetTitle>
                <SheetDescription>A BIN/card discount rule.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="card_no">Card number (BIN)</Label>
                  <Input id="card_no" name="card_no" type="number" defaultValue={editing?.card_no} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank_id">Bank</Label>
                  <Select name="bank_id" defaultValue={editing?.bank_id ? String(editing.bank_id) : undefined}>
                    <SelectTrigger id="bank_id" className="w-full"><SelectValue placeholder="Select bank" /></SelectTrigger>
                    <SelectContent>
                      {banks.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.bank_title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card_category_id">Card Category</Label>
                  <Select name="card_category_id" defaultValue={editing?.card_category_id ? String(editing.card_category_id) : undefined}>
                    <SelectTrigger id="card_category_id" className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.card_category}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card_type_id">Card Type</Label>
                  <Select name="card_type_id" defaultValue={editing?.card_type_id ? String(editing.card_type_id) : undefined}>
                    <SelectTrigger id="card_type_id" className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {types.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.card_type}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country_id">Country</Label>
                  <Select name="country_id" defaultValue={editing?.country_id ? String(editing.country_id) : undefined}>
                    <SelectTrigger id="country_id" className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="percentage">Discount %</Label>
                  <Input id="percentage" name="percentage" type="number" step="0.01" max={100} defaultValue={editing?.percentage} required />
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search card details..." />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this card detail?" onConfirm={handleDelete} />
    </div>
  );
}

function MobileCardsTab() {
  const [rows, setRows] = useState<MobileCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await mobileCardService.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load mobile cards"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await mobileCardService.list({ limit: 200 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load mobile cards"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search device IDs..." searchColumn="device_id" />
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
          <LookupTab config={{ label: "Bank", field: "bank_title", service: bankService as unknown as LookupConfig["service"] }} />
        </TabsContent>
        <TabsContent value="card-categories" className="mt-4">
          <LookupTab config={{ label: "Card Category", field: "card_category", service: cardCategoryService as unknown as LookupConfig["service"] }} />
        </TabsContent>
        <TabsContent value="card-types" className="mt-4">
          <LookupTab config={{ label: "Card Type", field: "card_type", service: cardTypeService as unknown as LookupConfig["service"] }} />
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
