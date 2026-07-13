import { createCrudService } from "@/lib/createCrudService";

export const slideService = createCrudService("/admin/slide");
export const homeBannerService = createCrudService("/admin/home-banner");
export const applicationHomeBannerService = createCrudService("/admin/application-home-banner");
export const sideBannerService = createCrudService("/admin/side-banner");
export const applicationSlideService = createCrudService("/admin/application-slide");
export const mobileSliderService = createCrudService("/admin/mobile-slider");
