import { createCrudService } from "@/lib/createCrudService";
import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Bank, CardCategory, CardDetail, CardType, MobileCard } from "@/types/payment";

export const bankService = createCrudService<Bank>("/admin/bank", { listKey: "banks" });
export const cardCategoryService = createCrudService<CardCategory>("/admin/card-category", {
  listKey: "cardCategories",
});
export const cardTypeService = createCrudService<CardType>("/admin/card-type", { listKey: "cardTypes" });
export const cardDetailService = createCrudService<CardDetail>("/admin/card-detail", { listKey: "cardDetails" });

// mobile-card is read-only admin-side (no create/update route on the backend).
export const mobileCardService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ mobileCards: MobileCard[]; meta: PaginationMeta }>>("/admin/mobile-card", {
        params,
      })
      .then((res) => ({ items: res.data.data.mobileCards, meta: res.data.data.meta })),

  remove: (id: number | string) =>
    http.delete<ApiSuccessResponse<null>>(`/admin/mobile-card/${id}`).then((res) => res.data.data),
};
