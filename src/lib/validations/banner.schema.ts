import { z } from "zod";
import { optionalText, requiredText } from "@/lib/validation";

// home-banner, application-home-banner, application-slide and mobile-slider
// (backed/src/modules/banners/shared/imageResource.routes.js) are just an
// image + status — nothing else to validate, so they have no schema here.

// Mirrors backed/src/modules/banners/validations/slide.validation.js
export const slideBannerSchema = z.object({
  Heading: optionalText(255),
  bullet_1: optionalText(255),
  bullet_2: optionalText(255),
  bullet_3: optionalText(255),
  link: optionalText(2000),
});

// Mirrors backed/src/modules/banners/routes/admin.sideBanner.routes.js
export const sideBannerSchema = z.object({
  type: requiredText(1, 255, "Type"),
});

export type SlideBannerInput = z.infer<typeof slideBannerSchema>;
export type SideBannerInput = z.infer<typeof sideBannerSchema>;
