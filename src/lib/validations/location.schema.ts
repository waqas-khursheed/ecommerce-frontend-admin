import { z } from "zod";
import { requiredSelectId, requiredText } from "@/lib/validation";

// Mirrors backed/src/modules/locations/routes/admin.country.routes.js
export const countrySchema = z.object({
  country_name: requiredText(2, 100, "Name"),
  country_code: z
    .string()
    .trim()
    .length(2, "Code must be exactly 2 letters")
    .regex(/^[a-zA-Z]{2}$/, "Code must be letters only"),
});

// Mirrors backed/src/modules/locations/routes/admin.state.routes.js
export const stateSchema = z.object({
  name: requiredText(2, 30, "Name"),
  country_id: requiredSelectId("Country"),
});

// Mirrors backed/src/modules/locations/routes/admin.city.routes.js
export const citySchema = z.object({
  name: requiredText(2, 30, "Name"),
  state_id: requiredSelectId("State"),
});

// Mirrors backed/src/modules/locations/routes/admin.geoZone.routes.js
export const geoZoneSchema = z.object({
  name: requiredText(1, 50, "Name"),
  code: requiredText(1, 50, "Code"),
});

export type CountryInput = z.infer<typeof countrySchema>;
export type StateInput = z.infer<typeof stateSchema>;
export type CityInput = z.infer<typeof citySchema>;
export type GeoZoneInput = z.infer<typeof geoZoneSchema>;
