export interface SlideBanner {
  id: number;
  image: string | null;
  status: 0 | 1;
  Heading: string | null;
  bullet_1: string | null;
  bullet_2: string | null;
  bullet_3: string | null;
  link: string | null;
}

export interface SimpleBanner {
  id: number;
  image: string | null;
  status: 0 | 1;
}

export interface SideBannerItem {
  id: number;
  image: string | null;
  status: 0 | 1;
  type: string;
}

export interface MobileSliderItem {
  id: number;
  image: string | null;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export type BannerKind = "slide" | "simple" | "side" | "mobile-slider";
