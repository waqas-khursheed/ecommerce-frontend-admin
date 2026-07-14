import type { Brand } from "./brand";
import type { Category } from "./category";

export interface ProductGalleryImage {
  id: number;
  product_id: number;
  image: string;
}

export interface ProductCategoryAssignment {
  id: number;
  product_id: number;
  category_id: number;
  category: Category;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  short_desc: string | null;
  long_desc: string | null;
  features: string | null;
  inside_box: string | null;

  price: number;
  d_price: number;
  d_percentage: number;
  dis_start_date: string | null;
  dis_end_date: string | null;

  quantity: number;
  sku: string | null;
  status: 0 | 1;
  sold: number;

  video_1: string | null;
  video_2: string | null;

  featured_image: string;
  hovered_image: string | null;
  featured_image_alt: string | null;
  featured_image_title: string | null;
  hovered_image_alt: string | null;
  hovered_image_title: string | null;
  size_chart_alt: string | null;
  size_chart_title: string | null;

  brand_id: number | null;
  is_variation: boolean;
  is_prescription: boolean;
  weight: number | null;

  new_arrival: 0 | 1;
  best_seller: 0 | 1;

  meta_keywords: string | null;
  meta_description: string | null;

  created_at: string;
  updated_at: string;

  // Only present on create/update/getById responses (withRelations=true) —
  // not on the list endpoint's rows (list only includes `brand`).
  brand?: Brand | null;
  productGalleries?: ProductGalleryImage[];
  assignCatToProducts?: ProductCategoryAssignment[];
}

// `featured_image`/`hovered_image`/`gallery` are sent as multipart files —
// the form builds a FormData object itself at submit time.
export interface ProductFormValues {
  title: string;
  short_desc?: string;
  long_desc?: string;
  features?: string;
  inside_box?: string;

  price: number;
  d_price?: number;
  d_percentage?: number;
  dis_start_date?: string;
  dis_end_date?: string;

  quantity: number;
  sku?: string;
  status: 0 | 1;

  video_1?: string;
  video_2?: string;

  featured_image_alt?: string;
  featured_image_title?: string;
  hovered_image_alt?: string;
  hovered_image_title?: string;

  brand_id?: number | null;
  category_ids?: number[];

  is_variation?: boolean;
  is_prescription?: boolean;
  weight?: number;
  new_arrival?: 0 | 1;
  best_seller?: 0 | 1;

  meta_keywords?: string;
  meta_description?: string;
}
