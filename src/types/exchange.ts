export interface Exchange {
  id: number;
  order_id: number | null;
  order_number: string | null;
  customer_name: string;
  return_item_code: string | null;
  return_item_name: string | null;
  return_item_size: string | null;
  email: string | null;
  phone_number: string | null;
  date: string | null;
  reason: string | null;
  other_detail: string | null;
  required_item_code: string | null;
  required_item_name: string | null;
  required_item_size: string | null;
  seen: 0 | 1;
  created_at: string;
  updated_at: string;
  order?: { id: number; order_number: string; status: number; grand_total: number } | null;
}
