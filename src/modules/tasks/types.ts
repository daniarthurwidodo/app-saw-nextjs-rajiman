export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface SubtaskImage {
  image_id: number;
  url: string;
  uploaded_at: string;
}

export interface Subtask {
  subtask_id: number;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  images?: SubtaskImage[];
}

export interface Task {
  task_id: number;
  title: string;
  description: string | null;
  assigned_to: number | null;
  assigned_user_name?: string;
  created_by: number;
  created_by_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  approval_status: ApprovalStatus;
  approved_by_user_id: number | null;
  approved_by_name?: string;
  approval_date: string | null;
  created_at: string;
  updated_at: string;
  // Subtask-related fields
  subtasks?: Subtask[];
  subtasks_count?: number;
  completed_subtasks?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assigned_to?: number;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigned_to?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  created_by?: number;
  approval_status?: ApprovalStatus;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface TasksListResponse {
  success: boolean;
  message: string;
  tasks: Task[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskResponse {
  success: boolean;
  message: string;
  task: Task;
}

export interface TasksByStatusResponse {
  success: boolean;
  message: string;
  tasks: {
    todo: Task[];
    in_progress: Task[];
    done: Task[];
  };
}

export class TasksError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'TasksError';
  }
}
