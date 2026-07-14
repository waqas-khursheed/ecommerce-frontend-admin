import { createCrudService } from "@/lib/createCrudService";
import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { Coupon, CouponPayload, CouponUsage } from "@/types/coupon";

export const couponService = {
  ...createCrudService<Coupon, CouponPayload>("/admin/coupon", { listKey: "coupons" }),

  getUsages: (id: number | string, params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ usages: CouponUsage[]; meta: PaginationMeta }>>(`/admin/coupon/${id}/usages`, {
        params,
      })
      .then((res) => ({ items: res.data.data.usages, meta: res.data.data.meta })),
};
