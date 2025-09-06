import { SubtaskStatus } from '@/types';

export interface Subtask {
  subtask_id: number;
  relation_task_id: number;
  subtask_title: string;
  subtask_description: string | null;
  assigned_to: number | null;
  assigned_user_name?: string;
  subtask_status: SubtaskStatus;
  subtask_comment: string | null;
  subtask_date: string | null;
  created_at: string;
  updated_at: string;
  // Related task information
  task_title?: string;
  task_created_by?: number;
  task_created_by_name?: string;
}

export interface CreateSubtaskRequest {
  relation_task_id: number;
  subtask_title: string;
  subtask_description?: string;
  assigned_to?: number;
  subtask_date?: string;
}

export interface UpdateSubtaskRequest {
  subtask_title?: string;
  subtask_description?: string;
  assigned_to?: number;
  subtask_status?: SubtaskStatus;
  subtask_comment?: string;
  subtask_date?: string;
}

export interface SubtaskFilters {
  relation_task_id?: number;
  subtask_status?: SubtaskStatus;
  assigned_to?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SubtasksListResponse {
  success: boolean;
  message: string;
  subtasks: Subtask[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SubtaskResponse {
  success: boolean;
  message: string;
  subtask: Subtask;
}

export interface SubtasksByTaskResponse {
  success: boolean;
  message: string;
  subtasks: Subtask[];
  taskInfo?: {
    task_id: number;
    title: string;
    status: string;
    created_by_name: string;
  };
}

export interface SubtasksByStatusResponse {
  success: boolean;
  message: string;
  subtasks: {
    todo: Subtask[];
    in_progress: Subtask[];
    done: Subtask[];
  };
}

export interface SubtaskProgressSummary {
  task_id: number;
  task_title: string;
  total_subtasks: number;
  completed_subtasks: number;
  in_progress_subtasks: number;
  todo_subtasks: number;
  completion_percentage: number;
}

export interface SubtasksProgressResponse {
  success: boolean;
  message: string;
  progress: SubtaskProgressSummary[];
}

export class SubtasksError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'SubtasksError';
  }
}
