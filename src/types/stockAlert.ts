import type { AttributeItem } from "./attribute";

export interface StockAlert {
  id: number;
  product_id: number;
  stock_id: number | null;
  email: string;
  notified_at: string | null;
  created_at: string;
  product?: { id: number; title: string };
  // null when the alert watches a non-variant product's own quantity rather
  // than one specific variant — see database/models/StockAlert.js.
  stock?: {
    id: number;
    color?: AttributeItem | null;
    size?: AttributeItem | null;
    fitting?: AttributeItem | null;
  } | null;
}
