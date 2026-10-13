import type {
  Department,
  DepartmentDetails,
  DepartmentInput,
  LoginInput,
  LoginResponse,
  Project,
  ProjectDetails,
  ProjectInput,
  RegisterInput,
  SystemAccount,
  Tag,
  TagInput,
  TaskInput,
  TaskItem,
  UpdateAccountInput,
} from "@/types";
import { clearAuth, getToken } from "@/lib/auth";

function cleanApiUrl(raw: string | undefined): string {
  if (!raw) return "http://localhost:5000";
  const match = raw.match(/https?:\/\/[a-zA-Z0-9\.\-]+(:[0-9]+)?/);
  return match ? match[0].replace(/\/$/, "") : raw.trim().replace(/\/$/, "");
}

const API_URL = cleanApiUrl(process.env.NEXT_PUBLIC_API_URL);

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors?: Record<string, string[]>) {
    super(message);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401) {
    if (path.startsWith("/api/auth/")) {
      const body = await response.json().catch(() => ({}));
      const message = body.detail || body.title || "Invalid email or password.";
      throw new ApiError(message, 401);
    }
    clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError("Session expired or unauthorized. Please log in.", 401);
  }

  if (response.status === 403) {
    throw new ApiError("Access forbidden: You do not have permission for this resource.", 403);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const errors = body.errors as Record<string, string[]> | undefined;
    const message = errors
      ? Object.values(errors).flat().join(" ")
      : body.detail || body.title || "Request failed.";
    throw new ApiError(message, response.status, errors);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

export const api = {
  auth: {
    register: (data: RegisterInput) => request<SystemAccount>("/api/auth/register", json("POST", data)),
    login: (data: LoginInput) => request<LoginResponse>("/api/auth/login", json("POST", data)),
  },
  accounts: {
    list: () => request<SystemAccount[]>("/api/accounts"),
    get: (id: number | string) => request<SystemAccount>(`/api/accounts/${id}`),
    update: (id: number, data: UpdateAccountInput) => request<SystemAccount>(`/api/accounts/${id}`, json("PUT", data)),
    remove: (id: number) => request<void>(`/api/accounts/${id}`, { method: "DELETE" }),
  },
  departments: {
    list: () => request<Department[]>("/api/departments"),
    get: (id: number | string) => request<DepartmentDetails>(`/api/departments/${id}`),
    search: (name: string) => request<Department[]>(`/api/departments/search?name=${encodeURIComponent(name)}`),
    create: (data: DepartmentInput) => request<Department>("/api/departments", json("POST", data)),
    update: (id: number, data: DepartmentInput) => request<Department>(`/api/departments/${id}`, json("PUT", data)),
    remove: (id: number) => request<void>(`/api/departments/${id}`, { method: "DELETE" }),
  },
  projects: {
    list: () => request<Project[]>("/api/projects"),
    get: (id: number | string) => request<ProjectDetails>(`/api/projects/${id}`),
    byDepartment: (id: number) => request<Project[]>(`/api/projects/department/${id}`),
    search: (query: URLSearchParams | string) => request<Project[]>(`/api/projects/search?${query}`),
    create: (data: ProjectInput) => request<Project>("/api/projects", json("POST", data)),
    update: (id: number, data: ProjectInput) => request<Project>(`/api/projects/${id}`, json("PUT", data)),
    remove: (id: number) => request<void>(`/api/projects/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => request<TaskItem[]>("/api/tasks"),
    get: (id: number | string) => request<TaskItem>(`/api/tasks/${id}`),
    byProject: (id: number) => request<TaskItem[]>(`/api/tasks/project/${id}`),
    search: (query: URLSearchParams | string) => request<TaskItem[]>(`/api/tasks/search?${query}`),
    create: (data: TaskInput) => request<TaskItem>("/api/tasks", json("POST", data)),
    update: (id: number, data: TaskInput) => request<TaskItem>(`/api/tasks/${id}`, json("PUT", data)),
    remove: (id: number) => request<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  tags: {
    list: () => request<Tag[]>("/api/tags"),
    create: (data: TagInput) => request<Tag>("/api/tags", json("POST", data)),
    update: (id: number, data: TagInput) => request<Tag>(`/api/tags/${id}`, json("PUT", data)),
    remove: (id: number) => request<void>(`/api/tags/${id}`, { method: "DELETE" }),
  },
};
