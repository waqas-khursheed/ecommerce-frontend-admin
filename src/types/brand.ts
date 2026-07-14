export interface Brand {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  logo: string;
  banner: string;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface BrandFormValues {
  title: string;
  description?: string;
  status: 0 | 1;
}
