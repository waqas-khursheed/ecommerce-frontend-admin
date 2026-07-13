export interface NotificationRow {
  id: number;
  title: string;
  detail: string;
  type: "order" | "stock" | "review" | "system";
  time: string;
  read: boolean;
}

export const notifications: NotificationRow[] = [
  { id: 1, title: "New order received", detail: "Order #ORD-7891 placed by Emma Wilson · $299.00", type: "order", time: "2 minutes ago", read: false },
  { id: 2, title: "Low stock alert", detail: '"Overshirt with pockets" has 4 units left', type: "stock", time: "1 hour ago", read: false },
  { id: 3, title: "New review submitted", detail: '5-star review on "Half Shirt" by Maria Santos', type: "review", time: "3 hours ago", read: false },
  { id: 4, title: "Coupon usage limit reached", detail: '"SUMMER25" reached 120 of 500 redemptions', type: "system", time: "5 hours ago", read: true },
  { id: 5, title: "New subscriber", detail: "amir.khan@example.com joined the newsletter", type: "system", time: "1 day ago", read: true },
];
