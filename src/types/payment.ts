export interface Bank {
  id: number;
  bank_title: string;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface CardCategory {
  id: number;
  card_category: string;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface CardType {
  id: number;
  card_type: string;
  status: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface CardDetail {
  id: number;
  card_no: number;
  country_id: number;
  card_category_id: number;
  card_type_id: number;
  bank_id: number;
  status: 0 | 1;
  percentage: number;
  created_at: string;
  updated_at: string;
  country?: { id: number; country_name: string };
  cardCategory?: CardCategory;
  cardType?: CardType;
  bank?: Bank;
}

export interface MobileCard {
  id: number;
  card_id: number;
  card_no: number;
  percentage: number;
  device_id: string;
  created_at: string;
  card?: CardDetail;
}
