import type { Product } from "./product";
import type { AttributeItem } from "./attribute";

export interface Stock {
  id: number;
  product_id: number;
  stock_qty: number | null;
  stock_dis_price: number;
  stock_dis_percentage: number;
  stock_dis_from_date: string | null;
  stock_dis_to_date: string | null;
  stock_dis_from_time: string | null;
  stock_dis_to_time: string | null;
  stock_price: number | null;
  weight: number | null;
  color_id: number | null;
  size_id: number | null;
  fitting_id: number | null;
  created_at: string;
  updated_at: string;
  // Included on every response (single and list rows alike) — color_id/size_id/
  // fitting_id all resolve to `attribute_items` rows, just aliased differently.
  product?: Product;
  color?: AttributeItem | null;
  size?: AttributeItem | null;
  fitting?: AttributeItem | null;
}

export interface StockFormValues {
  product_id: number;
  stock_qty?: number | null;
  stock_dis_price?: number;
  stock_dis_percentage?: number;
  stock_dis_from_date?: string;
  stock_dis_to_date?: string;
  stock_dis_from_time?: string;
  stock_dis_to_time?: string;
  stock_price?: number;
  weight?: number;
  color_id?: number | null;
  size_id?: number | null;
  fitting_id?: number | null;
}
