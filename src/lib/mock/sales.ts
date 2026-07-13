export interface OrderRow {
  id: string;
  customer: string;
  email: string;
  product: string;
  status: "Completed" | "Processing" | "Pending" | "Cancelled";
  date: string;
  amount: number;
  trend: "up" | "down";
}

export const orders: OrderRow[] = [
  { id: "ORD-7891", customer: "Emma Wilson", email: "emma@example.com", product: "Pro Dashboard License", status: "Completed", date: "Feb 14, 2026", amount: 299.0, trend: "up" },
  { id: "ORD-7890", customer: "James Chen", email: "james@company.io", product: "Team Plan Upgrade", status: "Processing", date: "Feb 14, 2026", amount: 599.0, trend: "up" },
  { id: "ORD-7889", customer: "Sofia Garcia", email: "sofia@startup.co", product: "Enterprise License", status: "Completed", date: "Feb 13, 2026", amount: 1499.0, trend: "up" },
  { id: "ORD-7888", customer: "Alex Thompson", email: "alex@dev.com", product: "Single License", status: "Pending", date: "Feb 13, 2026", amount: 79.0, trend: "up" },
  { id: "ORD-7887", customer: "Maria Santos", email: "maria@agency.co", product: "Pro Dashboard License", status: "Completed", date: "Feb 12, 2026", amount: 299.0, trend: "up" },
  { id: "ORD-7886", customer: "David Kim", email: "david@tech.io", product: "Team Plan Upgrade", status: "Cancelled", date: "Feb 12, 2026", amount: 599.0, trend: "down" },
  { id: "ORD-7885", customer: "Lisa Park", email: "lisa@design.co", product: "Pro Dashboard License", status: "Completed", date: "Feb 11, 2026", amount: 299.0, trend: "up" },
  { id: "ORD-7884", customer: "Ryan Mitchell", email: "ryan@startup.io", product: "Enterprise License", status: "Completed", date: "Feb 11, 2026", amount: 1499.0, trend: "up" },
  { id: "ORD-7883", customer: "Nina Patel", email: "nina@corp.com", product: "Single License", status: "Processing", date: "Feb 10, 2026", amount: 79.0, trend: "up" },
  { id: "ORD-7882", customer: "Tom Bradley", email: "tom@agency.io", product: "Team Plan Upgrade", status: "Pending", date: "Feb 10, 2026", amount: 599.0, trend: "up" },
];

export interface CustomerRow {
  id: number;
  name: string;
  email: string;
  location: string;
  orders: number;
  spend: number;
  status: "Active" | "Pending" | "Inactive";
  joined: string;
}

export const customers: CustomerRow[] = [
  { id: 1, name: "Jenny Wilson", email: "sara.cruz@example.com", location: "USA", orders: 20, spend: 866.78, status: "Active", joined: "Jan 12, 2026" },
  { id: 2, name: "Ronald Richards", email: "debra.holt@example.com", location: "UK", orders: 8, spend: 743.56, status: "Pending", joined: "Jan 18, 2026" },
  { id: 3, name: "Devon Lane", email: "michael.mitc@example.com", location: "Canada", orders: 9, spend: 690.6, status: "Active", joined: "Feb 2, 2026" },
  { id: 4, name: "Courtney Henry", email: "kenzi.lawson@example.com", location: "France", orders: 6, spend: 652.04, status: "Pending", joined: "Feb 5, 2026" },
  { id: 5, name: "Guy Hawkins", email: "willie.jenn@example.com", location: "India", orders: 12, spend: 746.98, status: "Active", joined: "Feb 9, 2026" },
  { id: 6, name: "Savannah Nguyen", email: "nathan.robert@example.com", location: "Italy", orders: 4, spend: 312.4, status: "Inactive", joined: "Feb 11, 2026" },
];

export interface ReviewRow {
  id: number;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  status: "Approved" | "Pending" | "Rejected";
  date: string;
}

export const reviews: ReviewRow[] = [
  { id: 1, customer: "Emma Wilson", product: "Overshirt with pockets", rating: 5, comment: "Fits perfectly and the fabric quality is great.", status: "Approved", date: "Feb 12, 2026" },
  { id: 2, customer: "James Chen", product: "Classic Shirt", rating: 4, comment: "Good value for the price.", status: "Approved", date: "Feb 11, 2026" },
  { id: 3, customer: "Sofia Garcia", product: "Wool Sweater", rating: 2, comment: "Runs smaller than expected.", status: "Pending", date: "Feb 10, 2026" },
  { id: 4, customer: "Alex Thompson", product: "Light Jacket", rating: 1, comment: "Arrived with a stitching defect.", status: "Rejected", date: "Feb 9, 2026" },
  { id: 5, customer: "Maria Santos", product: "Half Shirt", rating: 5, comment: "Great everyday shirt, ordering another.", status: "Approved", date: "Feb 8, 2026" },
];
