export interface Department {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface DepartmentUser {
  departmentId: number;
  userId: string;
  role: string;
}
