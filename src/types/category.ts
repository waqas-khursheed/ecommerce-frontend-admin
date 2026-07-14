export interface Category {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  meta_title: string | null;
  image: string | null;
  icon: string | null;
  meta_keywords: string | null;
  meta_desc: string | null;
  size_chart_mobile: string | null;
  size_chart: string | null;
  is_size_chart: boolean;
  parent_id: number;
  order_by: number;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

// `image`/`icon` are sent as multipart files, not part of this JSON-shaped
// payload — the form builds a FormData object itself at submit time.
export interface CategoryFormValues {
  title: string;
  description?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_desc?: string;
  parent_id?: number;
  status: 0 | 1;
  order_by?: number;
  is_size_chart?: boolean;
}
