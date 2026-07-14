export interface MetaCouponCategory {
  id: number;
  cat_id: number;
  coupon_id: number;
  cat?: { id: number; title: string };
}

export interface Coupon {
  id: number;
  code: string;
  percentage: number;
  created_at: string;
  status: 0 | 1;
  to_all: 0 | 1 | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  min_order_amount: number | null;
  // Only present on GET /:id, create, and update responses — not on the list endpoint.
  metaCouponCategories?: MetaCouponCategory[];
}

export interface CouponUsage {
  id: number;
  coupon_id: number;
  user_id: number | null;
  created_at: string;
  user?: { id: number; first_name: string; last_name: string; email: string } | null;
}

export interface CouponPayload {
  code: string;
  percentage: number;
  status: 0 | 1;
  to_all?: 0 | 1;
  category_ids?: number[];
  expires_at?: string | null;
  usage_limit?: number | null;
  min_order_amount?: number | null;
}
