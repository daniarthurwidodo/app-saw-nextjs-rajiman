import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DocumentType } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Documentation upload API called ===');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const subtaskId = formData.get('subtask_id') as string;
    const docType = formData.get('doc_type') as string;
    const uploadedBy = formData.get('uploaded_by') as string;

    console.log('Form data received:', {
      hasFile: !!file,
      fileName: file?.name,
      subtaskId,
      docType,
      uploadedBy,
    });

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    if (!subtaskId) {
      return NextResponse.json(
        { success: false, message: 'Subtask ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Verify subtask exists
    const parsedSubtaskId = parseInt(subtaskId);
    console.log('Looking for subtask with ID:', parsedSubtaskId);

    if (isNaN(parsedSubtaskId) || parsedSubtaskId <= 0) {
      console.log('Invalid subtask ID format:', subtaskId);
      return NextResponse.json(
        { success: false, message: 'Invalid subtask ID format' },
        { status: 400 }
      );
    }

    let subtask;
    try {
      subtask = await prisma.subtask.findUnique({
        where: { id: parsedSubtaskId },
      });
      console.log('Found subtask:', !!subtask);
      if (subtask) {
        console.log('Subtask details:', { id: subtask.id, title: subtask.title });
      }
    } catch (dbError) {
      console.error('Database error when finding subtask:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error when verifying subtask' },
        { status: 500 }
      );
    }

    if (!subtask) {
      console.log('Subtask not found');
      return NextResponse.json({ success: false, message: 'Subtask not found' }, { status: 404 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documentation');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${timestamp}_${subtaskId}.${extension}`;
    const filePath = join(uploadsDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save to database
    console.log('Saving to database with data:', {
      subtaskId: parsedSubtaskId,
      docType: (docType as DocumentType) || DocumentType.DOCUMENTATION,
      filePath: `/uploads/documentation/${fileName}`,
      fileName: file.name,
      uploadedBy: uploadedBy ? parseInt(uploadedBy) : null,
    });

    let documentation;
    try {
      documentation = await prisma.documentation.create({
        data: {
          subtaskId: parsedSubtaskId,
          docType: (docType as DocumentType) || DocumentType.DOCUMENTATION,
          filePath: `/uploads/documentation/${fileName}`,
          fileName: file.name,
          uploadedBy: uploadedBy ? parseInt(uploadedBy) : null,
        },
        include: {
          subtask: true,
          uploader: true,
        },
      });
      console.log('Documentation saved successfully:', documentation.id);
    } catch (dbError) {
      console.error('Database error when saving documentation:', dbError);
      console.error('Error details:', {
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        message: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : 'No stack',
      });
      return NextResponse.json(
        {
          success: false,
          message: 'Database error when saving file record',
          error:
            process.env.NODE_ENV === 'development'
              ? dbError instanceof Error
                ? dbError.message
                : String(dbError)
              : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      documentation,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subtaskId = searchParams.get('subtask_id');

    const where = subtaskId ? { subtaskId: parseInt(subtaskId) } : {};

    const documentation = await prisma.documentation.findMany({
      where,
      include: {
        subtask: true,
        uploader: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Documentation retrieved successfully',
      documentation,
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
