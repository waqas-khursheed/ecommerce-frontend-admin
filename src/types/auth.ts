export interface Admin {
  id: number;
  name: string;
  email: string;
  image: string | null;
  is_admin: 0 | 1;
  is_active: 0 | 1;
}

export interface UpdateAdminProfilePayload {
  name?: string;
  email?: string;
  image?: File;
}

export interface ChangeAdminPasswordPayload {
  old_password: string;
  new_password: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  is_admin?: 0 | 1;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResult {
  admin: Admin;
  token: string;
}
