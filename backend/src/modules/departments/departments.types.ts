export interface Department {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  deletedAt: Date | null;
  createdAt: Date;
}

export interface DepartmentUser {
  departmentId: number;
  userId: string;
  role: string;
}
