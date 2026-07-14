export interface DashboardOverview {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  totalProducts: number;
  totalUsers: number;
  activeUsers: number;
}

export interface OrderStats {
  statusCounts: { status: number; count: number }[];
  paymentStatusCounts: { paymentStatus: string; count: number }[];
}

export interface TopProductItem {
  product: { id: number; title: string; featured_image: string | null };
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface SalesReportItem {
  date: string;
  orderCount: number;
  revenue: number;
}
