export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  meta_title: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  icon: string | null;
  description: string | null;
  meta_description: string | null;
  body_description: string | null;
}

export interface ProductTagAssignment {
  id: number;
  product_id: number;
  tag_id: number;
  tag?: ProductTag;
}

export interface MetaTagRow {
  id: number;
  meta_tag: string;
  tag_id: number;
}
