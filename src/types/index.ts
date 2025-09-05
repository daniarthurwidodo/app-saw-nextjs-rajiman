// User Roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  KEPALA_SEKOLAH = 'kepala_sekolah',
  USER = 'user',
}

// Task Status
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

// Task Priority
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Subtask Status
export enum SubtaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

// Approval Status
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Document Types
export enum DocumentType {
  DOCUMENTATION = 'documentation',
  PAYMENT = 'payment',
  ATTENDANCE = 'attendance',
}

// User Interface Types
export interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  school_id?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface School {
  sekolah_id: number;
  nama_sekolah: string;
  alamat?: string;
  kontak?: string;
  kepala_sekolah_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  task_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  assigned_user_name?: string; // Added for API response
  created_by?: number;
  created_by_name?: string; // Added for API response
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  approval_status?: ApprovalStatus;
  approved_by_user_id?: number;
  approved_by_name?: string; // Added for API response
  approval_date?: string;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[]; // Added subtasks array
  subtasks_count?: number; // Added for progress tracking
  completed_subtasks?: number; // Added for progress tracking
}

export interface SubtaskImage {
  image_id: number;
  url: string;
  uploaded_at: string;
}

export interface Subtask {
  subtask_id: number;
  relation_task_id?: number;
  title: string; // Updated to match API response
  subtask_title?: string; // Keep for backward compatibility
  subtask_description?: string;
  assigned_to?: number;
  assigned_user_name?: string;
  is_completed?: boolean;
  status: SubtaskStatus; // Updated to use enum
  created_at: string;
  updated_at: string;
  images?: SubtaskImage[]; // Added images array
}

export interface Documentation {
  doc_id: number;
  subtask_id?: number;
  doc_type: DocumentType;
  file_path?: string;
  file_name?: string;
  uploaded_by?: number;
  uploaded_at: string;
}

export interface Report {
  report_id: number;
  task_id?: number;
  created_by?: number;
  report_data?: object;
  rating?: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Criteria {
  criteria_id: number;
  criteria_name: string;
  weight: number;
  description?: string;
  created_by?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Dashboard Types
export interface DashboardStats {
  totalSchools: number;
  activeTasks: number;
  completedTasks: number;
  usersOnline: number;
}
