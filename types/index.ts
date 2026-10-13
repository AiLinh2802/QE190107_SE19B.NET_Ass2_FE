export interface Department {
  departmentId: number;
  departmentName: string;
  departmentDescription: string;
  isActive: boolean;
}

export interface DepartmentDetails extends Department {
  projects: Project[];
}

export interface Project {
  projectId: number;
  projectName: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: number;
  departmentId: number;
  departmentName: string;
  isActive: boolean;
  createdDate: string;
}

export interface ProjectDetails extends Project {
  tasks: TaskItem[];
}

export interface Tag {
  tagId: number;
  tagName: string;
  color?: string | null;
}

export interface TaskItem {
  taskId: number;
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueDate?: string | null;
  projectId: number;
  projectName: string;
  createdById?: number | null;
  createdByName?: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
  tags: Tag[];
}

export type DepartmentInput = Omit<Department, "departmentId">;
export type ProjectInput = Omit<Project, "projectId" | "departmentName" | "createdDate">;
export interface TaskInput {
  title: string;
  description?: string | null;
  status: number;
  priority: number;
  dueDate?: string | null;
  projectId: number;
  isActive: boolean;
  tagIds: number[];
}
export type TagInput = Omit<Tag, "tagId">;

// --- Assignment 2: Authentication & Accounts ---
export interface SystemAccount {
  accountId: number;
  fullName: string;
  email: string;
  role: number; // 0 = Staff, 1 = Admin
  roleName: string;
  createdDate: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  account: SystemAccount;
}

export interface UpdateAccountInput {
  fullName: string;
  role: number;
}
