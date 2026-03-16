export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export interface UserDepartment {
  id: string;
  email: string;
  name: string;
}
