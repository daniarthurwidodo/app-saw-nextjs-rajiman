import { DocumentType } from '@/types';

export interface Document {
  doc_id: number;
  subtask_id: number | null;
  doc_type: DocumentType;
  file_path: string | null;
  file_name: string | null;
  uploaded_by: number | null;
  uploaded_by_name?: string;
  uploaded_at: string;
  file_size?: number;
  mime_type?: string;
}

export interface UploadDocumentRequest {
  subtask_id?: number;
  doc_type: DocumentType;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
}

export interface DocumentFilters {
  doc_type?: DocumentType;
  uploaded_by?: number;
  subtask_id?: number;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface DocumentsListResponse {
  success: boolean;
  message: string;
  documents: Document[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DocumentResponse {
  success: boolean;
  message: string;
  document: Document;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  document?: Document;
  uploadUrl?: string;
}

export class DocumentsError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'DocumentsError';
  }
}
