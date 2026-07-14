export interface Country {
  id: number;
  country_code: string;
  country_name: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  country?: Country;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
  state?: State;
}

export interface GeoZone {
  id: number;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCityAssignment {
  id: number;
  product_id: number;
  city_id: number;
  created_at: string;
  updated_at: string;
  city: { id: number; name: string; state_id: number };
}
