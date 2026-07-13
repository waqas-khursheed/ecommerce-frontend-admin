export interface BannerRow {
  id: number;
  title: string;
  position: number;
  status: "Active" | "Inactive";
  updated: string;
}

// Keyed by the six admin banner sub-resources (backed/src/modules/banners).
export const bannerGroups: Record<string, BannerRow[]> = {
  slide: [
    { id: 1, title: "Spring Collection Hero", position: 1, status: "Active", updated: "Feb 10, 2026" },
    { id: 2, title: "Winter Clearance", position: 2, status: "Active", updated: "Feb 8, 2026" },
    { id: 3, title: "New Arrivals", position: 3, status: "Inactive", updated: "Jan 30, 2026" },
  ],
  "home-banner": [
    { id: 1, title: "Free Shipping Banner", position: 1, status: "Active", updated: "Feb 11, 2026" },
    { id: 2, title: "Loyalty Program Promo", position: 2, status: "Active", updated: "Feb 5, 2026" },
  ],
  "application-home-banner": [
    { id: 1, title: "App Exclusive Deals", position: 1, status: "Active", updated: "Feb 9, 2026" },
  ],
  "side-banner": [
    { id: 1, title: "Men's Category Side Ad", position: 1, status: "Active", updated: "Feb 7, 2026" },
    { id: 2, title: "Women's Category Side Ad", position: 2, status: "Active", updated: "Feb 7, 2026" },
  ],
  "application-slide": [
    { id: 1, title: "App Onboarding Slide 1", position: 1, status: "Active", updated: "Jan 28, 2026" },
    { id: 2, title: "App Onboarding Slide 2", position: 2, status: "Active", updated: "Jan 28, 2026" },
  ],
  "mobile-slider": [
    { id: 1, title: "Mobile Flash Sale", position: 1, status: "Active", updated: "Feb 12, 2026" },
  ],
};

export interface CouponRow {
  id: number;
  code: string;
  type: "Percentage" | "Fixed";
  value: number;
  used: number;
  limit: number;
  expiry: string;
  status: "Active" | "Expired" | "Draft";
}

export const coupons: CouponRow[] = [
  { id: 1, code: "WELCOME10", type: "Percentage", value: 10, used: 342, limit: 1000, expiry: "Mar 31, 2026", status: "Active" },
  { id: 2, code: "FREESHIP", type: "Fixed", value: 5, used: 891, limit: 2000, expiry: "Apr 15, 2026", status: "Active" },
  { id: 3, code: "SUMMER25", type: "Percentage", value: 25, used: 120, limit: 500, expiry: "Jun 1, 2026", status: "Draft" },
  { id: 4, code: "VIP50", type: "Fixed", value: 50, used: 76, limit: 100, expiry: "Jan 1, 2026", status: "Expired" },
];
