export interface Review {
  id: number;
  product_id: number;
  review: string;
  rate: number;
  created_at: string;
  user_id: number;
  name: string;
  status: 0 | 1 | 2;
  is_verified_purchase: 0 | 1;
  product?: { id: number; title: string; slug?: string; featured_image?: string | null };
  user?: { id: number; first_name: string; last_name: string; email: string };
}

/** 0 = pending, 1 = approved, 2 = rejected (per review.service.js comment) */
export const REVIEW_STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
};
