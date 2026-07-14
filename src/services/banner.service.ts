import { createCrudService } from "@/lib/createCrudService";
import type { MobileSliderItem, SideBannerItem, SimpleBanner, SlideBanner } from "@/types/banner";

export const slideService = createCrudService<SlideBanner>("/admin/slide", { listKey: "slides" });
export const homeBannerService = createCrudService<SimpleBanner>("/admin/home-banner", {
  listKey: "homeBanners",
});
export const applicationHomeBannerService = createCrudService<SimpleBanner>("/admin/application-home-banner", {
  listKey: "applicationHomeBanners",
});
export const sideBannerService = createCrudService<SideBannerItem>("/admin/side-banner", {
  listKey: "sideBanners",
});
export const applicationSlideService = createCrudService<SimpleBanner>("/admin/application-slide", {
  listKey: "applicationSlides",
});
export const mobileSliderService = createCrudService<MobileSliderItem>("/admin/mobile-slider", {
  listKey: "mobileSliders",
});
