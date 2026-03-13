export interface GooglePayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}
