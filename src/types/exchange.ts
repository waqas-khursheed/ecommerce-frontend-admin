export type ExchangeStatus = 0 | 1 | 2 | 3; // Pending / Approved / Rejected / Completed

export const EXCHANGE_STATUS_LABELS: Record<ExchangeStatus, string> = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Completed",
};

export interface ExchangeOrderDetail {
  id: number;
  order_id: number;
  product_id: number;
  color_id: number | null;
  size_id: number | null;
  fitting_id: number | null;
  quantity: number;
  price: number;
  dis_price: number;
  total: number;
  product?: { id: number; title: string; slug: string; featured_image: string | null };
}

export interface ExchangeRequestedStock {
  id: number;
  product_id: number;
  product?: { id: number; title: string; slug: string; featured_image: string | null };
}

// Mirrors backed/src/modules/exchanges/repositories/exchange.repository.js detailIncludes.
export interface Exchange {
  id: number;
  order_id: number | null;
  user_id: number | null;
  order_detail_id: number | null;
  requested_stock_id: number | null;
  order_number: string | null;
  customer_name: string;
  return_item_code: string | null;
  return_item_name: string | null;
  return_item_size: string | null;
  email: string | null;
  phone_number: string | null;
  reason: string | null;
  other_detail: string | null;
  required_item_code: string | null;
  required_item_name: string | null;
  required_item_size: string | null;
  seen: 0 | 1;
  status: ExchangeStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  order?: { id: number; order_number: string; status: number; grand_total: number } | null;
  orderDetail?: ExchangeOrderDetail | null;
  requestedStock?: ExchangeRequestedStock | null;
}

export interface UpdateExchangeStatusPayload {
  status: 1 | 2 | 3;
  admin_note?: string;
}
