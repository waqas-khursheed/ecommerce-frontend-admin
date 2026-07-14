"use client";

import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table/data-table";
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
import { cityService, countryService, geoZoneService, productCityService, stateService } from "@/services/location.service";
import { productService } from "@/services/product.service";
import type { City, Country, GeoZone, State } from "@/types/location";
import type { Product } from "@/types/product";

function CountriesTab() {
  const [rows, setRows] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Country | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await countryService.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load countries"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await countryService.list({ limit: 200 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load countries"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      country_code: String(formData.get("country_code") ?? "").toUpperCase(),
      country_name: String(formData.get("country_name") ?? ""),
    };
    try {
      if (editing) {
        await countryService.update(editing.id, payload);
        toast.success("Country updated");
      } else {
        await countryService.create(payload);
        toast.success("Country created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save country"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await countryService.remove(deletingId);
      toast.success("Country deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete country"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Country, unknown>[]>(
    () => [
      { accessorKey: "country_name", header: "Name" },
      { accessorKey: "country_code", header: "Code" },
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
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add Country</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Country" : "Add Country"}</SheetTitle>
                <SheetDescription>Top of the location hierarchy.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="country_name">Name</Label>
                  <Input id="country_name" name="country_name" defaultValue={editing?.country_name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country_code">Code (2 letters)</Label>
                  <Input id="country_code" name="country_code" maxLength={2} defaultValue={editing?.country_code} required />
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search countries..." searchColumn="country_name" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this country?" onConfirm={handleDelete} />
    </div>
  );
}

function StatesTab() {
  const [rows, setRows] = useState<State[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<State | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await stateService.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load states"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [stateRes, countryRes] = await Promise.all([
          stateService.list({ limit: 200 }),
          countryService.list({ limit: 200 }),
        ]);
        setRows(stateRes.items);
        setCountries(countryRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load states"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      name: String(formData.get("name") ?? ""),
      country_id: Number(formData.get("country_id") ?? 0),
    };
    try {
      if (editing) {
        await stateService.update(editing.id, payload);
        toast.success("State updated");
      } else {
        await stateService.create(payload);
        toast.success("State created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save state"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await stateService.remove(deletingId);
      toast.success("State deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete state"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<State, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { id: "country", header: "Country", accessorFn: (row) => row.country?.country_name ?? `#${row.country_id}` },
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
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add State</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit State" : "Add State"}</SheetTitle>
                <SheetDescription>Belongs to a country.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country_id">Country</Label>
                  <Select name="country_id" defaultValue={editing?.country_id ? String(editing.country_id) : undefined}>
                    <SelectTrigger id="country_id" className="w-full">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.country_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search states..." searchColumn="name" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this state?" onConfirm={handleDelete} />
    </div>
  );
}

function CitiesTab() {
  const [rows, setRows] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<City | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await cityService.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load cities"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [cityRes, stateRes] = await Promise.all([
          cityService.list({ limit: 200 }),
          stateService.list({ limit: 200 }),
        ]);
        setRows(cityRes.items);
        setStates(stateRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load cities"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      name: String(formData.get("name") ?? ""),
      state_id: Number(formData.get("state_id") ?? 0),
    };
    try {
      if (editing) {
        await cityService.update(editing.id, payload);
        toast.success("City updated");
      } else {
        await cityService.create(payload);
        toast.success("City created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save city"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await cityService.remove(deletingId);
      toast.success("City deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete city"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<City, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { id: "state", header: "State", accessorFn: (row) => row.state?.name ?? `#${row.state_id}` },
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
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add City</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit City" : "Add City"}</SheetTitle>
                <SheetDescription>Belongs to a state.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state_id">State</Label>
                  <Select name="state_id" defaultValue={editing?.state_id ? String(editing.state_id) : undefined}>
                    <SelectTrigger id="state_id" className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search cities..." searchColumn="name" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this city?" onConfirm={handleDelete} />
    </div>
  );
}

function GeoZonesTab() {
  const [rows, setRows] = useState<GeoZone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<GeoZone | null>(null);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    try {
      const { items } = await geoZoneService.list({ limit: 200 });
      setRows(items);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load geo zones"));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const { items } = await geoZoneService.list({ limit: 200 });
        setRows(items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load geo zones"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    const payload = {
      code: String(formData.get("code") ?? ""),
      name: String(formData.get("name") ?? ""),
    };
    try {
      if (editing) {
        await geoZoneService.update(editing.id, payload);
        toast.success("Zone updated");
      } else {
        await geoZoneService.create(payload);
        toast.success("Zone created");
      }
      setOpen(false);
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save zone"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await geoZoneService.remove(deletingId);
      toast.success("Zone deleted");
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete zone"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = useMemo<ColumnDef<GeoZone, unknown>[]>(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "code", header: "Code" },
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
          <SheetTrigger render={<Button size="sm" onClick={() => setEditing(null)}><Plus />Add Zone</Button>} />
          <SheetContent>
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? "Edit Zone" : "Add Zone"}</SheetTitle>
                <SheetDescription>A delivery/shipping zone.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" name="code" defaultValue={editing?.code} required />
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} searchPlaceholder="Search zones..." searchColumn="name" />
      <ConfirmDeleteDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)} title="Delete this zone?" onConfirm={handleDelete} />
    </div>
  );
}

function ProductAvailabilityTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [assignedCityIds, setAssignedCityIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [productRes, cityRes] = await Promise.all([
          productService.list({ limit: 200 }),
          cityService.list({ limit: 200 }),
        ]);
        setProducts(productRes.items);
        setCities(cityRes.items);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load products/cities"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loadAssignments = async (productId: string | null) => {
    setSelectedProductId(productId ?? "");
    if (!productId) {
      setAssignedCityIds(new Set());
      return;
    }
    try {
      const assignments = await productCityService.getByProduct(productId);
      setAssignedCityIds(new Set(assignments.map((a) => a.city_id)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load product availability"));
    }
  };

  const toggleCity = (cityId: number) => {
    setAssignedCityIds((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) next.delete(cityId);
      else next.add(cityId);
      return next;
    });
  };

  const handleSync = async () => {
    if (!selectedProductId) return;
    setIsSyncing(true);
    try {
      await productCityService.sync(selectedProductId, Array.from(assignedCityIds));
      toast.success("Availability updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update availability"));
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="product">Product</Label>
        <Select value={selectedProductId} onValueChange={loadAssignments}>
          <SelectTrigger id="product" className="w-full">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProductId && (
        <>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => (
              <label key={city.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <Checkbox
                  checked={assignedCityIds.has(city.id)}
                  onCheckedChange={() => toggleCity(city.id)}
                />
                {city.name}
              </label>
            ))}
          </div>
          <Button onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Saving..." : "Save availability"}
          </Button>
        </>
      )}
    </div>
  );
}

export default function LocationsPage() {
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
          <CountriesTab />
        </TabsContent>
        <TabsContent value="states" className="mt-4">
          <StatesTab />
        </TabsContent>
        <TabsContent value="cities" className="mt-4">
          <CitiesTab />
        </TabsContent>
        <TabsContent value="zones" className="mt-4">
          <GeoZonesTab />
        </TabsContent>
        <TabsContent value="product-city" className="mt-4">
          <ProductAvailabilityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
