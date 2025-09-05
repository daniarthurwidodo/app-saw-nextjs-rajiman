'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

interface Document {
  document_id: number;
  title: string;
  description: string;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  status: 'active' | 'archived' | 'draft';
  uploaded_by: string;
  uploaded_at: string;
  school_id?: number;
  school_name?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real app this would be an API call
      const mockDocuments: Document[] = [
        {
          document_id: 1,
          title: 'Student Registration Form 2024',
          description: 'Official form for new student registration process',
          file_name: 'registration_form_2024.pdf',
          file_type: 'PDF',
          file_size: 2.5,
          category: 'Forms',
          status: 'active',
          uploaded_by: 'Admin User',
          uploaded_at: '2024-01-15T10:30:00Z',
          school_id: 1,
          school_name: 'SDN 01 Jakarta',
        },
        {
          document_id: 2,
          title: 'Academic Calendar 2024',
          description: 'Complete academic calendar for the year 2024',
          file_name: 'academic_calendar_2024.pdf',
          file_type: 'PDF',
          file_size: 1.8,
          category: 'Calendar',
          status: 'active',
          uploaded_by: 'Principal',
          uploaded_at: '2024-01-10T09:15:00Z',
        },
        {
          document_id: 3,
          title: 'Teacher Handbook',
          description: 'Guidelines and policies for teaching staff',
          file_name: 'teacher_handbook_2024.docx',
          file_type: 'DOCX',
          file_size: 3.2,
          category: 'Policies',
          status: 'active',
          uploaded_by: 'HR Manager',
          uploaded_at: '2024-01-08T14:20:00Z',
        },
        {
          document_id: 4,
          title: 'Monthly Report Template',
          description: 'Standard template for monthly reporting',
          file_name: 'monthly_report_template.xlsx',
          file_type: 'XLSX',
          file_size: 0.8,
          category: 'Templates',
          status: 'draft',
          uploaded_by: 'Admin User',
          uploaded_at: '2024-01-05T11:45:00Z',
        },
        {
          document_id: 5,
          title: 'Old Curriculum Guide',
          description: "Previous year's curriculum guide (archived)",
          file_name: 'curriculum_guide_2023.pdf',
          file_type: 'PDF',
          file_size: 4.1,
          category: 'Curriculum',
          status: 'archived',
          uploaded_by: 'Academic Head',
          uploaded_at: '2023-12-20T16:30:00Z',
        },
        {
          document_id: 6,
          title: 'Student Assessment Guidelines',
          description: 'Comprehensive guide for student evaluation methods',
          file_name: 'assessment_guidelines_2024.pdf',
          file_type: 'PDF',
          file_size: 2.1,
          category: 'Guidelines',
          status: 'active',
          uploaded_by: 'Academic Head',
          uploaded_at: '2024-01-12T13:20:00Z',
          school_id: 2,
          school_name: 'SMP 05 Bandung',
        },
        {
          document_id: 7,
          title: 'Parent-Teacher Conference Form',
          description: 'Form for scheduling parent-teacher meetings',
          file_name: 'ptc_form_2024.docx',
          file_type: 'DOCX',
          file_size: 0.5,
          category: 'Forms',
          status: 'active',
          uploaded_by: 'Teacher',
          uploaded_at: '2024-01-14T09:30:00Z',
        },
        {
          document_id: 8,
          title: 'School Safety Protocol',
          description: 'Emergency procedures and safety guidelines',
          file_name: 'safety_protocol_2024.pdf',
          file_type: 'PDF',
          file_size: 1.9,
          category: 'Policies',
          status: 'active',
          uploaded_by: 'Safety Officer',
          uploaded_at: '2024-01-11T15:45:00Z',
        },
        {
          document_id: 9,
          title: 'Budget Planning Template',
          description: 'Template for annual budget planning',
          file_name: 'budget_template_2024.xlsx',
          file_type: 'XLSX',
          file_size: 1.2,
          category: 'Templates',
          status: 'draft',
          uploaded_by: 'Finance Manager',
          uploaded_at: '2024-01-09T11:15:00Z',
        },
        {
          document_id: 10,
          title: 'Library Management System Manual',
          description: 'User manual for the library management system',
          file_name: 'library_manual_2024.docx',
          file_type: 'DOCX',
          file_size: 3.8,
          category: 'Manuals',
          status: 'active',
          uploaded_by: 'Librarian',
          uploaded_at: '2024-01-07T14:00:00Z',
        },
        {
          document_id: 11,
          title: 'Sports Competition Rules',
          description: 'Rules and regulations for inter-school competitions',
          file_name: 'sports_rules_2024.pdf',
          file_type: 'PDF',
          file_size: 1.5,
          category: 'Guidelines',
          status: 'active',
          uploaded_by: 'Sports Coordinator',
          uploaded_at: '2024-01-06T10:20:00Z',
          school_id: 3,
          school_name: 'SMA 03 Surabaya',
        },
        {
          document_id: 12,
          title: 'Disciplinary Action Form',
          description: 'Form for documenting disciplinary actions',
          file_name: 'disciplinary_form_2024.docx',
          file_type: 'DOCX',
          file_size: 0.7,
          category: 'Forms',
          status: 'active',
          uploaded_by: 'Discipline Officer',
          uploaded_at: '2024-01-04T16:10:00Z',
        },
        {
          document_id: 13,
          title: 'Maintenance Request Form',
          description: 'Form for requesting facility maintenance',
          file_name: 'maintenance_request_2024.pdf',
          file_type: 'PDF',
          file_size: 0.6,
          category: 'Forms',
          status: 'draft',
          uploaded_by: 'Facility Manager',
          uploaded_at: '2024-01-03T12:30:00Z',
        },
        {
          document_id: 14,
          title: 'Curriculum Standards 2023',
          description: "Previous year's curriculum standards (archived)",
          file_name: 'curriculum_standards_2023.pdf',
          file_type: 'PDF',
          file_size: 5.2,
          category: 'Curriculum',
          status: 'archived',
          uploaded_by: 'Curriculum Head',
          uploaded_at: '2023-12-15T09:45:00Z',
        },
        {
          document_id: 15,
          title: 'Technology Usage Policy',
          description: 'Guidelines for technology use in educational settings',
          file_name: 'tech_policy_2024.docx',
          file_type: 'DOCX',
          file_size: 2.3,
          category: 'Policies',
          status: 'active',
          uploaded_by: 'IT Manager',
          uploaded_at: '2024-01-02T13:50:00Z',
        },
      ];
      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.school_name && doc.school_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'uploaded_at':
        aValue = new Date(a.uploaded_at);
        bValue = new Date(b.uploaded_at);
        break;
      case 'file_size':
        aValue = a.file_size;
        bValue = b.file_size;
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalItems = sortedDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = sortedDocuments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      archived: 'secondary',
      draft: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = [...new Set(documents.map((doc) => doc.category))];

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className='container mx-auto p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Document Management</h1>
          <p className='text-muted-foreground'>Manage and organize school documents</p>
        </div>
        <Button>
          <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Documents</CardTitle>
            <svg
              className='h-4 w-4 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active</CardTitle>
            <svg
              className='h-4 w-4 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {documents.filter((doc) => doc.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Draft</CardTitle>
            <svg
              className='h-4 w-4 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {documents.filter((doc) => doc.status === 'draft').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Archived</CardTitle>
            <svg
              className='h-4 w-4 text-muted-foreground'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 8l6 6m0 0l6-6m-6 6V3'
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {documents.filter((doc) => doc.status === 'archived').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Search & Filter</span>
            {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant='ghost'
                size='sm'
                onClick={clearSearch}
                className='text-muted-foreground'
              >
                <X className='w-4 h-4 mr-1' />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='lg:col-span-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  placeholder='Search documents, descriptions, files...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Categories' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='archived'>Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder='Items per page' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='5'>5 per page</SelectItem>
                <SelectItem value='10'>10 per page</SelectItem>
                <SelectItem value='25'>25 per page</SelectItem>
                <SelectItem value='50'>50 per page</SelectItem>
                <SelectItem value='100'>100 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort options */}
          <div className='flex items-center gap-4 mt-4 pt-4 border-t'>
            <span className='text-sm text-muted-foreground'>Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='w-48'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='title'>Title</SelectItem>
                <SelectItem value='uploaded_at'>Upload Date</SelectItem>
                <SelectItem value='file_size'>File Size</SelectItem>
                <SelectItem value='category'>Category</SelectItem>
                <SelectItem value='status'>Status</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className='p-2'
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>
              Documents ({totalItems.toLocaleString()})
              {searchTerm && (
                <span className='text-sm font-normal text-muted-foreground ml-2'>
                  matching "{searchTerm}"
                </span>
              )}
            </CardTitle>
            <div className='text-sm text-muted-foreground'>
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex justify-center items-center py-8'>
              <Spinner />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='cursor-pointer' onClick={() => handleSort('title')}>
                      <div className='flex items-center'>
                        Document
                        {sortBy === 'title' && (
                          <span className='ml-1'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className='cursor-pointer' onClick={() => handleSort('file_size')}>
                      <div className='flex items-center'>
                        Size
                        {sortBy === 'file_size' && (
                          <span className='ml-1'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className='cursor-pointer' onClick={() => handleSort('category')}>
                      <div className='flex items-center'>
                        Category
                        {sortBy === 'category' && (
                          <span className='ml-1'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className='cursor-pointer' onClick={() => handleSort('status')}>
                      <div className='flex items-center'>
                        Status
                        {sortBy === 'status' && (
                          <span className='ml-1'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead className='cursor-pointer' onClick={() => handleSort('uploaded_at')}>
                      <div className='flex items-center'>
                        Date
                        {sortBy === 'uploaded_at' && (
                          <span className='ml-1'>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDocuments.map((document) => (
                    <TableRow key={document.document_id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{document.title}</div>
                          <div className='text-sm text-muted-foreground'>
                            {document.description}
                          </div>
                          {document.school_name && (
                            <div className='text-xs text-blue-600'>{document.school_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>{document.file_type}</Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(document.file_size)}</TableCell>
                      <TableCell>{document.category}</TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell>{document.uploaded_by}</TableCell>
                      <TableCell>{formatDate(document.uploaded_at)}</TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button variant='ghost' size='sm'>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              />
                            </svg>
                          </Button>
                          <Button variant='ghost' size='sm'>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z'
                              />
                            </svg>
                          </Button>
                          <Button variant='ghost' size='sm'>
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                              />
                            </svg>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedDocuments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                          ? 'No documents found matching your criteria.'
                          : 'No documents available.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className='flex items-center justify-between mt-6 pt-6 border-t'>
                  <div className='text-sm text-muted-foreground'>
                    Page {currentPage} of {totalPages} • {totalItems.toLocaleString()} total items
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </Button>

                    {/* Page numbers */}
                    <div className='flex items-center gap-1'>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => goToPage(pageNum)}
                            className='w-9 h-9 p-0'
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className='w-4 h-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
