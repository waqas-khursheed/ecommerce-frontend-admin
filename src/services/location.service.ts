import { createCrudService } from "@/lib/createCrudService";
import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type { City, Country, GeoZone, ProductCityAssignment, State } from "@/types/location";

// Flat location hierarchy — the one actually referenced by product-city/user
// addresses/card details (as opposed to the parallel geo_* reference tables,
// which aren't part of the admin build-order's "Locations" tabs).
export const countryService = createCrudService<Country>("/admin/country", { listKey: "countries" });
export const stateService = createCrudService<State>("/admin/state", { listKey: "states" });
export const cityService = createCrudService<City>("/admin/city", { listKey: "cities" });

export const geoZoneService = createCrudService<GeoZone>("/admin/geo-zone", { listKey: "zones" });

// Product/city availability is keyed by productId, not a standard CRUD list —
// GET fetches the cities currently assigned to a product, PUT fully replaces them.
export const productCityService = {
  getByProduct: (productId: number | string) =>
    http
      .get<ApiSuccessResponse<{ productCities: ProductCityAssignment[] }>>(`/admin/product-city/${productId}`)
      .then((res) => res.data.data.productCities),

  sync: (productId: number | string, cityIds: number[]) =>
    http
      .put<ApiSuccessResponse<{ productCities: ProductCityAssignment[] }>>(`/admin/product-city/${productId}`, {
        city_ids: cityIds,
      })
      .then((res) => res.data.data.productCities),
};
