export interface UserStatus {
  ok: boolean;
  offline: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: object | null;
  message?: string;
}
