export interface WebSetting {
  id: number;
  main_logo: string | null;
  fav_icon: string | null;
  website_link: string | null;
  website_name: string | null;
  address: string | null;
  email: string | null;
  phone_one: string | null;
  phone_two: string | null;
  copyright: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  delivery_days: string | null;
  delivery_start_time: string | null;
  delivery_end_time: string | null;
  min_amount_for_free_delivery: number;
  shipping_rate: number;
  location_mod: 0 | 1;
  delivery_days_time_mod: 0 | 1;
  meta_keywords: string | null;
  meta_description: string | null;
  updated_at: string;
}
