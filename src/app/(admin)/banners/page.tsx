"use client";

import { useState } from "react";
import { GalleryHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/data-table/status-badge";
import { RowActions } from "@/components/data-table/row-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bannerGroups, type BannerRow } from "@/lib/mock/marketing";

const TABS = [
  { value: "slide", label: "Slides" },
  { value: "home-banner", label: "Home Banner" },
  { value: "application-home-banner", label: "App Home Banner" },
  { value: "side-banner", label: "Side Banner" },
  { value: "application-slide", label: "App Slide" },
  { value: "mobile-slider", label: "Mobile Slider" },
];

function BannerGrid({ banners }: { banners: BannerRow[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {banners.map((banner) => (
        <div key={banner.id} className="overflow-hidden rounded-lg border">
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
            <GalleryHorizontal className="size-8" />
          </div>
          <div className="flex items-start justify-between gap-2 p-3">
            <div>
              <p className="text-sm font-medium">{banner.title}</p>
              <p className="text-xs text-muted-foreground">
                Position {banner.position} · Updated {banner.updated}
              </p>
              <div className="mt-1.5">
                <StatusBadge status={banner.status} />
              </div>
            </div>
            <RowActions
              onEdit={() => toast.info(`Edit "${banner.title}" (UI only)`)}
              onDelete={() => toast.success(`"${banner.title}" deleted`)}
            />
          </div>
        </div>
      ))}
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
        actions={
          <Button onClick={() => toast.info("UI only, not wired up yet")}>
            <Plus />
            Add Banner
          </Button>
        }
      />

      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="flex-wrap h-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <BannerGrid banners={bannerGroups[tab.value] ?? []} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
