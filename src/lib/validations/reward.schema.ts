import { z } from "zod";
import { nonNegativeInt } from "@/lib/validation";

// Mirrors backed/src/modules/rewards/routes/admin.rewardSetting.routes.js
export const rewardSettingSchema = z.object({
  minimum_points: nonNegativeInt("Minimum points"),
  points: nonNegativeInt("Points"),
  equal_to: nonNegativeInt("Equal to"),
});

// Mirrors backed/src/modules/rewards/routes/admin.rewardsEarningMethod.routes.js
export const rewardsEarningMethodSchema = z.object({
  purchase: nonNegativeInt("Purchase amount"),
  equals_to: nonNegativeInt("Equals to"),
});

export type RewardSettingInput = z.infer<typeof rewardSettingSchema>;
export type RewardsEarningMethodInput = z.infer<typeof rewardsEarningMethodSchema>;
