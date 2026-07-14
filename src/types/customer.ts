export interface UserAddress {
  id: number;
  address1: string | null;
  country_id1: number | null;
  state_id1: number | null;
  city_id1: number | null;
  code1: string | null;
  address2: string | null;
  country_id2: number | null;
  state_id2: number | null;
  city_id2: number | null;
  code2: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  username: string | null;
  phone: string | null;
  email: string;
  email_verified_at: string | null;
  type: string | null;
  company_name: string | null;
  provider_id: string | null;
  provider_name: string | null;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
  userAddresses?: UserAddress[];
}
