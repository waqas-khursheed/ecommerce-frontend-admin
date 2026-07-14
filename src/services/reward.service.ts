import { createCrudService } from "@/lib/createCrudService";
import { http } from "@/lib/http";
import type { ApiSuccessResponse, ListQueryParams, PaginationMeta } from "@/types/api";
import type { RewardSetting, RewardsEarningMethod, UserReward } from "@/types/reward";

export const rewardSettingService = createCrudService<RewardSetting>("/admin/reward-setting", {
  listKey: "rewardSettings",
});
export const rewardsEarningMethodService = createCrudService<RewardsEarningMethod>(
  "/admin/rewards-earning-method",
  { listKey: "rewardsEarningMethods" }
);

// user-reward is read-only admin-side (no create/update/delete on the backend).
export const userRewardService = {
  list: (params?: ListQueryParams) =>
    http
      .get<ApiSuccessResponse<{ userRewards: UserReward[]; meta: PaginationMeta }>>("/admin/user-reward", {
        params,
      })
      .then((res) => ({ items: res.data.data.userRewards, meta: res.data.data.meta })),
};
