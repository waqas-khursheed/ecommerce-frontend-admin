export interface OrderUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface OrderProduct {
  id: number;
  title: string;
  slug?: string;
  featured_image?: string | null;
}

export interface OrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  color_id: number | null;
  size_id: number;
  fitting_id: number | null;
  quantity: number;
  price: number;
  dis_price: number;
  total: number;
  product?: OrderProduct;
}

export interface BillingDetail {
  id: number;
  order_id: number;
  firstname: string;
  lastname: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  address_1: string;
  address_2: string | null;
  city: string;
  postcode: string | null;
  country: string;
  state: string;
}

export interface OrderStatusHistoryRow {
  id: number;
  order_id: number;
  field: string;
  from_value: string | null;
  to_value: string;
  changed_by_admin_id: number | null;
  created_at: string;
  changedByAdmin?: { id: number; name: string } | null;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  user_ip: string;
  status: number;
  pay_method: string;
  shipping: number;
  sub_total: number;
  coupon_discount: number | null;
  coupon_title: string | null;
  rewards_discount: number;
  grand_total: number;
  type: string | null;
  delivery_day: string | null;
  delivery_start_time: string | null;
  delivery_end_time: string | null;
  payment_status: PaymentStatus;
  order_type: number;
  is_deduction: number | null;
  seen: number;
  created_at: string;
  updated_at: string;
  user?: OrderUser;
  orderDetails?: OrderDetail[];
  billingDetails?: BillingDetail[];
  // Only present on GET /:id, not on the list endpoint.
  statusHistory?: OrderStatusHistoryRow[];
}

/**
 * The backend only validates `status` as an integer 0-9 with no named enum —
 * this label set is the admin UI's own convention for a typical order lifecycle.
 */
export const ORDER_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Completed",
  5: "Cancelled",
  6: "Returned",
  7: "Refunded",
  8: "Failed",
  9: "On Hold",
};

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
