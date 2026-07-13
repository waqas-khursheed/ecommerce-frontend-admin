import { createCrudService } from "@/lib/createCrudService";

export const rewardSettingService = createCrudService("/admin/reward-setting");
export const rewardsEarningMethodService = createCrudService("/admin/rewards-earning-method");
export const userRewardService = createCrudService("/admin/user-reward");
