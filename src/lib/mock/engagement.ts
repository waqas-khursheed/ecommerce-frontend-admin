export interface EarningMethodRow {
  id: number;
  name: string;
  points: number;
  status: "Active" | "Inactive";
}

export const rewardsEarningMethods: EarningMethodRow[] = [
  { id: 1, name: "Order Completed", points: 10, status: "Active" },
  { id: 2, name: "Product Review", points: 25, status: "Active" },
  { id: 3, name: "Referral Signup", points: 50, status: "Active" },
  { id: 4, name: "Birthday Bonus", points: 100, status: "Inactive" },
];

export interface UserRewardRow {
  id: number;
  customer: string;
  points: number;
  tier: "Bronze" | "Silver" | "Gold";
  lastEarned: string;
}

export const userRewards: UserRewardRow[] = [
  { id: 1, customer: "Jenny Wilson", points: 1280, tier: "Gold", lastEarned: "Feb 12, 2026" },
  { id: 2, customer: "Ronald Richards", points: 640, tier: "Silver", lastEarned: "Feb 10, 2026" },
  { id: 3, customer: "Devon Lane", points: 210, tier: "Bronze", lastEarned: "Feb 8, 2026" },
];

export const rewardSettings = {
  pointsPerCurrency: 1,
  currencyPerPoint: 100,
  minRedeemPoints: 500,
  expiryMonths: 12,
};

export interface QueryFormRow {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: "New" | "Responded" | "Closed";
  date: string;
}

export const queryForms: QueryFormRow[] = [
  { id: 1, name: "Priya Sharma", email: "priya@example.com", subject: "Order delivery delay", status: "New", date: "Feb 13, 2026" },
  { id: 2, name: "Mark Owens", email: "mark@example.com", subject: "Bulk order inquiry", status: "Responded", date: "Feb 11, 2026" },
  { id: 3, name: "Linda Brooks", email: "linda@example.com", subject: "Refund request", status: "Closed", date: "Feb 7, 2026" },
];

export interface SubscriberRow {
  id: number;
  email: string;
  subscribed: string;
  status: "Active" | "Unsubscribed";
}

export const subscribers: SubscriberRow[] = [
  { id: 1, email: "georgia.young@example.com", subscribed: "Feb 1, 2026", status: "Active" },
  { id: 2, email: "amir.khan@example.com", subscribed: "Jan 24, 2026", status: "Active" },
  { id: 3, email: "clara.diaz@example.com", subscribed: "Jan 15, 2026", status: "Unsubscribed" },
];
