export interface Admin {
  id: number;
  name: string;
  email: string;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResult {
  admin: Admin;
  token: string;
}
