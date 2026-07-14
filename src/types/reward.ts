export interface RewardSetting {
  id: number;
  minimum_points: number;
  points: number;
  equal_to: number;
}

export interface RewardsEarningMethod {
  id: number;
  purchase: number;
  equals_to: number;
}

export interface UserReward {
  id: number;
  user_id: number;
  rewards: number;
  user?: { id: number; first_name: string; last_name: string; email: string };
}
