export interface FaqCategory {
  id: number;
  title: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  slug: string;
  category_id: number;
  category?: FaqCategory;
}

export interface FaqPayload {
  question: string;
  answer: string;
  category_id: number;
}

export interface CommonPage {
  id: number;
  title: string;
  slug: string;
  heading: string | null;
  content: string;
  image: string | null;
  status: 0 | 1;
  page_name: string;
}

export interface ContactUsPage {
  id: number;
  map: string | null;
  status: 0 | 1;
  title: string;
  slug: string;
  content: string;
}
