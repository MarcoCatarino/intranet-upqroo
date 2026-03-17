export interface Department {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: Date;
}

export interface DepartmentUser {
  departmentId: number;
  userId: string;
  role: string;
}
