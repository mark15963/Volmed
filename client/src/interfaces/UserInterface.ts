export interface UserStatus {
  ok: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: object | null;
  message?: string;
}
