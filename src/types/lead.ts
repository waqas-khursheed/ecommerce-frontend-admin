export interface QueryForm {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  description: string;
  seen: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  seen: 0 | 1;
  status: 0 | 1;
  created_at: string;
}
