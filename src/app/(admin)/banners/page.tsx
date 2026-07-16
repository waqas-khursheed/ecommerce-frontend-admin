"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, GalleryHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { ConfirmDeleteDialog } from "@/components/data-table/confirm-delete-dialog";
import { ImageUploadField } from "@/components/data-table/image-upload-field";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { uploadUrl } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/apiError";
import { validateForm, type FieldErrors } from "@/lib/validation";
import { slideBannerSchema, sideBannerSchema } from "@/lib/validations/banner.schema";
import { FieldError } from "@/components/ui/field-error";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import type { PaginationMeta } from "@/types/api";
import type { SideBannerItem, SlideBanner } from "@/types/banner";
import {
  applicationHomeBannerService,
  applicationSlideService,
  homeBannerService,
  mobileSliderService,
  sideBannerService,
  slideService,
} from "@/services/banner.service";

interface BannerBase {
  id: number;
  image: string | null;
  status: 0 | 1;
}

interface BannerConfig<T extends BannerBase> {
  value: string;
  label: string;
  folder: string;
  service: {
    list: (params?: { page?: number; limit?: number }) => Promise<{ items: T[]; meta: PaginationMeta }>;
    create: (payload: FormData) => Promise<T>;
    update: (id: number, payload: FormData) => Promise<T>;
    remove: (id: number) => Promise<unknown>;
    toggleStatus: (id: number) => Promise<T>;
  };
  extraFields?: {
    render: (item: T | null, errors: FieldErrors, onFieldChange: (name: string) => void) => ReactNode;
    appendToForm: (formData: FormData, payload: FormData) => void;
    getErrors: (formData: FormData) => FieldErrors;
  };
}

const TABS: BannerConfig<BannerBase & Record<string, unknown>>[] = [
  {
    value: "slide",
    label: "Slides",
    folder: "slides",
    service: slideService as unknown as BannerConfig<BannerBase & Record<string, unknown>>["service"],
    extraFields: {
      render: (item, errors, onFieldChange) => {
        const slide = item as unknown as SlideBanner | null;
        return (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="Heading">Heading</Label>
              <Input
                id="Heading"
                name="Heading"
                defaultValue={slide?.Heading ?? ""}
                aria-invalid={!!errors.Heading}
                onChange={() => onFieldChange("Heading")}
              />
              <FieldError message={errors.Heading} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="bullet_1">Bullet 1</Label>
                <Input
                  id="bullet_1"
                  name="bullet_1"
                  defaultValue={slide?.bullet_1 ?? ""}
                  aria-invalid={!!errors.bullet_1}
                  onChange={() => onFieldChange("bullet_1")}
                />
                <FieldError message={errors.bullet_1} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bullet_2">Bullet 2</Label>
                <Input
                  id="bullet_2"
                  name="bullet_2"
                  defaultValue={slide?.bullet_2 ?? ""}
                  aria-invalid={!!errors.bullet_2}
                  onChange={() => onFieldChange("bullet_2")}
                />
                <FieldError message={errors.bullet_2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bullet_3">Bullet 3</Label>
                <Input
                  id="bullet_3"
                  name="bullet_3"
                  defaultValue={slide?.bullet_3 ?? ""}
                  aria-invalid={!!errors.bullet_3}
                  onChange={() => onFieldChange("bullet_3")}
                />
                <FieldError message={errors.bullet_3} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                name="link"
                defaultValue={slide?.link ?? ""}
                aria-invalid={!!errors.link}
                onChange={() => onFieldChange("link")}
              />
              <FieldError message={errors.link} />
            </div>
          </>
        );
      },
      appendToForm: (formData, payload) => {
        payload.append("Heading", String(formData.get("Heading") ?? ""));
        payload.append("bullet_1", String(formData.get("bullet_1") ?? ""));
        payload.append("bullet_2", String(formData.get("bullet_2") ?? ""));
        payload.append("bullet_3", String(formData.get("bullet_3") ?? ""));
        payload.append("link", String(formData.get("link") ?? ""));
      },
      getErrors: (formData) =>
        validateForm(slideBannerSchema, {
          Heading: String(formData.get("Heading") ?? ""),
          bullet_1: String(formData.get("bullet_1") ?? ""),
          bullet_2: String(formData.get("bullet_2") ?? ""),
          bullet_3: String(formData.get("bullet_3") ?? ""),
          link: String(formData.get("link") ?? ""),
        }).errors ?? {},
    },
  },
  {
    value: "home-banner",
    label: "Home Banner",
    folder: "home-banners",
    service: homeBannerService as unknown as BannerConfig<BannerBase & Record<string, unknown>>["service"],
  },
  {
    value: "application-home-banner",
    label: "App Home Banner",
    folder: "application-home-banners",
    service: applicationHomeBannerService as unknown as BannerConfig<
      BannerBase & Record<string, unknown>
    >["service"],
  },
  {
    value: "side-banner",
    label: "Side Banner",
    folder: "side-banners",
    service: sideBannerService as unknown as BannerConfig<BannerBase & Record<string, unknown>>["service"],
    extraFields: {
      render: (item, errors, onFieldChange) => {
        const side = item as unknown as SideBannerItem | null;
        return (
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Input
              id="type"
              name="type"
              defaultValue={side?.type ?? ""}
              aria-invalid={!!errors.type}
              onChange={() => onFieldChange("type")}
            />
            <FieldError message={errors.type} />
          </div>
        );
      },
      appendToForm: (formData, payload) => {
        payload.append("type", String(formData.get("type") ?? ""));
      },
      getErrors: (formData) =>
        validateForm(sideBannerSchema, { type: String(formData.get("type") ?? "") }).errors ?? {},
    },
  },
  {
    value: "application-slide",
    label: "App Slide",
    folder: "application-slides",
    service: applicationSlideService as unknown as BannerConfig<BannerBase & Record<string, unknown>>["service"],
  },
  {
    value: "mobile-slider",
    label: "Mobile Slider",
    folder: "mobile-sliders",
    service: mobileSliderService as unknown as BannerConfig<BannerBase & Record<string, unknown>>["service"],
  },
];

function BannerTab({ config }: { config: BannerConfig<BannerBase & Record<string, unknown>> }) {
  const {
    items: rows,
    setItems: setRows,
    isLoading,
    reload: load,
    pagination,
  } = usePaginatedList((params) => config.service.list(params), {
    pageSize: 10,
    errorMessage: `Failed to load ${config.label.toLowerCase()}`,
  });
  const [editing, setEditing] = useState<(BannerBase & Record<string, unknown>) | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (formData: FormData) => {
    const extraErrors = config.extraFields?.getErrors(formData) ?? {};
    const imageErrors: FieldErrors = {};
    if (!editing && !imageFile) imageErrors.image = "Image is required";

    if (Object.keys(extraErrors).length > 0 || Object.keys(imageErrors).length > 0) {
      setErrors({ ...extraErrors, ...imageErrors });
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("status", formData.get("status") ? "1" : "0");
    if (imageFile) payload.append("image", imageFile);
    config.extraFields?.appendToForm(formData, payload);

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
      setImageFile(null);
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

  const toggleStatus = async (item: BannerBase & Record<string, unknown>) => {
    try {
      const updated = await config.service.toggleStatus(item.id);
      setRows((prev) => prev.map((r) => (r.id === item.id ? { ...r, status: updated.status } : r)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update status"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditing(null);
              setImageFile(null);
            }
          }}
        >
          <SheetTrigger
            render={
              <Button
                onClick={() => {
                  setEditing(null);
                  setImageFile(null);
                  setErrors({});
                }}
              >
                <Plus />
                Add {config.label.replace(/s$/, "")}
              </Button>
            }
          />
          <SheetContent className="overflow-y-auto">
            <form action={handleSubmit} className="flex h-full flex-col">
              <SheetHeader>
                <SheetTitle>{editing ? `Edit ${config.label}` : `Add ${config.label}`}</SheetTitle>
                <SheetDescription>
                  {editing ? "Update this entry." : `Create a new ${config.label.toLowerCase()} entry.`}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 px-4">
                <ImageUploadField
                  id="image"
                  label="Image"
                  required={!editing}
                  error={errors.image}
                  existingImageUrl={uploadUrl(config.folder, editing?.image as string | undefined)}
                  onFileChange={(f) => {
                    setImageFile(f);
                    if (f && errors.image) setErrors((prev) => ({ ...prev, image: "" }));
                  }}
                />
                {config.extraFields?.render(editing, errors, (name) =>
                  setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev))
                )}
                <div className="flex items-center gap-2">
                  <Checkbox id="status" name="status" defaultChecked={(editing?.status ?? 1) === 1} />
                  <Label htmlFor="status">Active</Label>
                </div>
              </div>
              <SheetFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editing ? "Save changes" : "Create"}
                </Button>
                <SheetClose render={<Button variant="outline">Cancel</Button>} />
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No entries yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border">
              <div className="flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={uploadUrl(config.folder, item.image as string) ?? undefined}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <GalleryHorizontal className="size-8" />
                )}
              </div>
              <div className="flex items-start justify-between gap-2 p-3">
                <div>
                  <p className="text-sm font-medium">
                    {(item.Heading as string) || (item.type as string) || `#${item.id}`}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <StatusBadge status={item.status === 1 ? "Active" : "Inactive"} />
                    <Switch checked={item.status === 1} onCheckedChange={() => toggleStatus(item)} />
                  </div>
                </div>
                <RowActions
                  onEdit={() => {
                    setEditing(item);
                    setImageFile(null);
                    setErrors({});
                    setOpen(true);
                  }}
                  onDelete={() => setDeletingId(item.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDeleteDialog
        open={deletingId !== null}
        onOpenChange={(v) => !v && setDeletingId(null)}
        title={`Delete this ${config.label.toLowerCase().replace(/s$/, "")}?`}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function BannersPage() {
  const [active, setActive] = useState(TABS[0].value);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Banners"
        description="Manage promotional banners across web and mobile placements."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Banners" }]}
      />

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="h-auto flex-wrap">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <BannerTab config={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
