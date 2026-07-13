import { createCrudService } from "@/lib/createCrudService";

// Legacy flat location tables
export const countryService = createCrudService("/admin/country");
export const stateService = createCrudService("/admin/state");
export const cityService = createCrudService("/admin/city");

// Geo_* hierarchical location tables
export const geoContinentService = createCrudService("/admin/geo-continent");
export const geoSubContinentService = createCrudService("/admin/geo-sub-continent");
export const geoCountryService = createCrudService("/admin/geo-country");
export const geoStateService = createCrudService("/admin/geo-state");
export const geoCityService = createCrudService("/admin/geo-city");
export const geoZoneService = createCrudService("/admin/geo-zone");

// Product/city availability assignment
export const productCityService = createCrudService("/admin/product-city");
