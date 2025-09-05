'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Subtask } from '@/types';
import { User, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubtaskDetailDialogProps {
  subtask: Subtask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubtaskDetailDialog({
  subtask,
  open,
  onOpenChange,
}: SubtaskDetailDialogProps) {
  const subtaskTitle = subtask.title || subtask.subtask_title || 'Untitled Subtask';
  const isCompleted = subtask.status === 'done' || subtask.is_completed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {subtaskTitle}
            <Badge variant={isCompleted ? 'default' : 'secondary'}>
              {isCompleted ? 'Completed' : 'Pending'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          {subtask.subtask_description && (
            <div>
              <div className='text-sm font-medium text-gray-500 mb-1'>Description</div>
              <div className='text-sm text-gray-700 whitespace-pre-wrap'>
                {subtask.subtask_description}
              </div>
            </div>
          )}

          {subtask.assigned_user_name && (
            <div>
              <div className='text-sm font-medium text-gray-500 mb-1'>Assigned To</div>
              <div className='flex items-center text-sm text-gray-700'>
                <User className='h-4 w-4 mr-2' />
                {subtask.assigned_user_name}
              </div>
            </div>
          )}

          <div>
            <div className='text-sm font-medium text-gray-500 mb-1'>Status</div>
            <div className='flex items-center'>
              <input
                type='checkbox'
                checked={isCompleted}
                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                readOnly
              />
              <span className='ml-2 text-sm text-gray-700'>
                {isCompleted ? 'Completed' : 'Not completed'}
              </span>
            </div>
          </div>

          {subtask.images && subtask.images.length > 0 && (
            <div>
              <div className='text-sm font-medium text-gray-500 mb-2 flex items-center'>
                <ImageIcon className='h-4 w-4 mr-1' />
                Images ({subtask.images.length})
              </div>
              <div className='grid grid-cols-2 gap-2'>
                {subtask.images.map((image) => (
                  <div key={image.image_id} className='relative group'>
                    <img
                      src={image.url}
                      alt={`Subtask image ${image.image_id}`}
                      className='w-full h-24 object-cover rounded-md border border-gray-200 group-hover:opacity-80 transition-opacity'
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBWMTIwTTgwIDEwMEgxMjAiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHN2Zz4K';
                      }}
                    />
                    <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-md flex items-center justify-center transition-all'>
                      <a
                        href={image.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <ExternalLink className='h-6 w-6 text-white' />
                      </a>
                    </div>
                    <div className='absolute bottom-1 left-1 right-1'>
                      <div className='text-xs text-white bg-black bg-opacity-50 rounded px-1 py-0.5 truncate'>
                        {new Date(image.uploaded_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='pt-4 border-t border-gray-100 grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-gray-500 mb-1'>Created</div>
              <div className='text-sm text-gray-700'>
                {new Date(subtask.created_at).toLocaleString()}
              </div>
            </div>

            {subtask.updated_at !== subtask.created_at && (
              <div>
                <div className='text-sm font-medium text-gray-500 mb-1'>Last Updated</div>
                <div className='text-sm text-gray-700'>
                  {new Date(subtask.updated_at).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
