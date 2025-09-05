import { DocumentType } from '@/types';
import { UploadDocumentRequest, DocumentFilters, DocumentsError } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export class DocumentsValidator {
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  static readonly ALLOWED_EXTENSIONS = [
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'svg',
    'txt',
    'csv',
    'zip',
    'rar',
  ];
  static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
  ];

  static validateFileName(fileName: string): ValidationError | null {
    if (!fileName) {
      return { field: 'file_name', message: 'File name is required' };
    }

    if (fileName.length > 255) {
      return { field: 'file_name', message: 'File name must not exceed 255 characters' };
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension || !this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        field: 'file_name',
        message: `Invalid file type. Allowed types: ${this.ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    return null;
  }

  static validateFilePath(filePath: string): ValidationError | null {
    if (!filePath) {
      return { field: 'file_path', message: 'File path is required' };
    }

    if (filePath.length > 500) {
      return { field: 'file_path', message: 'File path must not exceed 500 characters' };
    }

    return null;
  }

  static validateFileSize(fileSize: number | undefined): ValidationError | null {
    if (fileSize !== undefined) {
      if (fileSize <= 0) {
        return { field: 'file_size', message: 'File size must be greater than 0' };
      }

      if (fileSize > this.MAX_FILE_SIZE) {
        return {
          field: 'file_size',
          message: `File size must not exceed ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
      }
    }

    return null;
  }

  static validateMimeType(mimeType: string | undefined): ValidationError | null {
    if (mimeType && !this.ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        field: 'mime_type',
        message: `Invalid MIME type. File type not supported.`,
      };
    }

    return null;
  }

  static validateDocumentType(docType: string): ValidationError | null {
    if (!docType) {
      return { field: 'doc_type', message: 'Document type is required' };
    }

    const validTypes = Object.values(DocumentType);
    if (!validTypes.includes(docType as DocumentType)) {
      return {
        field: 'doc_type',
        message: `Invalid document type. Must be one of: ${validTypes.join(', ')}`,
      };
    }

    return null;
  }

  static validateSubtaskId(subtaskId: number | undefined): ValidationError | null {
    if (subtaskId !== undefined) {
      if (!Number.isInteger(subtaskId) || subtaskId <= 0) {
        return {
          field: 'subtask_id',
          message: 'Subtask ID must be a positive integer',
        };
      }
    }

    return null;
  }

  static validateUploadDocument(data: UploadDocumentRequest): ValidationError[] {
    const errors: ValidationError[] = [];

    const fileNameError = this.validateFileName(data.file_name);
    if (fileNameError) errors.push(fileNameError);

    const filePathError = this.validateFilePath(data.file_path);
    if (filePathError) errors.push(filePathError);

    const docTypeError = this.validateDocumentType(data.doc_type);
    if (docTypeError) errors.push(docTypeError);

    const subtaskIdError = this.validateSubtaskId(data.subtask_id);
    if (subtaskIdError) errors.push(subtaskIdError);

    const fileSizeError = this.validateFileSize(data.file_size);
    if (fileSizeError) errors.push(fileSizeError);

    const mimeTypeError = this.validateMimeType(data.mime_type);
    if (mimeTypeError) errors.push(mimeTypeError);

    return errors;
  }

  static validateDocumentId(documentId: string | number): number {
    const id = typeof documentId === 'string' ? parseInt(documentId) : documentId;

    if (isNaN(id) || id <= 0) {
      throw new DocumentsError('Invalid document ID', 400, 'INVALID_DOCUMENT_ID');
    }

    return id;
  }

  static validatePagination(
    page: string | number = 1,
    limit: string | number = 10
  ): { page: number; limit: number } {
    const pageNum = typeof page === 'string' ? parseInt(page) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;

    const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validatedLimit = isNaN(limitNum) || limitNum < 1 ? 10 : Math.min(limitNum, 100);

    return { page: validatedPage, limit: validatedLimit };
  }

  static validateFilters(filters: any): DocumentFilters {
    const validatedFilters: DocumentFilters = {};

    if (filters.doc_type) {
      const validTypes = Object.values(DocumentType);
      if (validTypes.includes(filters.doc_type)) {
        validatedFilters.doc_type = filters.doc_type;
      }
    }

    if (filters.uploaded_by) {
      const uploadedBy = parseInt(filters.uploaded_by);
      if (!isNaN(uploadedBy) && uploadedBy > 0) {
        validatedFilters.uploaded_by = uploadedBy;
      }
    }

    if (filters.subtask_id) {
      const subtaskId = parseInt(filters.subtask_id);
      if (!isNaN(subtaskId) && subtaskId > 0) {
        validatedFilters.subtask_id = subtaskId;
      }
    }

    if (filters.search && typeof filters.search === 'string') {
      validatedFilters.search = filters.search.trim();
    }

    return validatedFilters;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static sanitizeUploadDocument(data: UploadDocumentRequest): UploadDocumentRequest {
    return {
      file_name: this.sanitizeInput(data.file_name),
      file_path: this.sanitizeInput(data.file_path),
      doc_type: data.doc_type,
      subtask_id: data.subtask_id,
      file_size: data.file_size,
      mime_type: data.mime_type,
    };
  }
}
