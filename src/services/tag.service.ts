import { createCrudService } from "@/lib/createCrudService";
import { http } from "@/lib/http";
import type { ApiSuccessResponse } from "@/types/api";
import type { MetaTagRow, ProductTag, ProductTagAssignment } from "@/types/tag";

export const tagService = {
  ...createCrudService<ProductTag, FormData, FormData>("/admin/tag", { listKey: "tags" }),

  getMetaTags: (tagId: number | string) =>
    http
      .get<ApiSuccessResponse<{ metaTags: MetaTagRow[] }>>(`/admin/tag/${tagId}/meta-tags`)
      .then((res) => res.data.data.metaTags),

  syncMetaTags: (tagId: number | string, metaTags: string[]) =>
    http
      .put<ApiSuccessResponse<{ metaTags: MetaTagRow[] }>>(`/admin/tag/${tagId}/meta-tags`, { meta_tags: metaTags })
      .then((res) => res.data.data.metaTags),
};

// Product <-> Tag assignment (assign_tag_to_products) — keyed by productId,
// full-replace sync, same shape as location.service.ts's productCityService.
export const productTagService = {
  getByProduct: (productId: number | string) =>
    http
      .get<ApiSuccessResponse<{ productTags: ProductTagAssignment[] }>>(`/admin/product-tag/${productId}`)
      .then((res) => res.data.data.productTags),

  sync: (productId: number | string, tagIds: number[]) =>
    http
      .put<ApiSuccessResponse<{ productTags: ProductTagAssignment[] }>>(`/admin/product-tag/${productId}`, {
        tag_ids: tagIds,
      })
      .then((res) => res.data.data.productTags),
};
