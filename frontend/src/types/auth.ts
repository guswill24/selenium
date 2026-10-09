export type Role = 'PASSENGER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  role: Role;
  status: 'ACTIVE' | 'LOCKED';
  fullName: string;
  email: string;
  phone: string;
}

export type ProfileUpdate = Pick<User, 'fullName' | 'email' | 'phone'>;

export interface Session {
  token: string;
  expiresAt: string;
  user: User;
}

export const roleLabels: Record<Role, string> = {
  PASSENGER: 'Pasajero',
  ADMIN: 'Administrador',
};
