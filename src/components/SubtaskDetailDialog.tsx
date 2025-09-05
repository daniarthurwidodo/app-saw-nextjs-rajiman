"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Subtask } from "@/types";
import { User } from "lucide-react";

interface SubtaskDetailDialogProps {
  subtask: Subtask & { assigned_user_name?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubtaskDetailDialog({ subtask, open, onOpenChange }: SubtaskDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{subtask.subtask_title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {subtask.subtask_description && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{subtask.subtask_description}</div>
            </div>
          )}
          
          {subtask.assigned_user_name && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Assigned To</div>
              <div className="flex items-center text-sm text-gray-700">
                <User className="h-4 w-4 mr-2" />
                {subtask.assigned_user_name}
              </div>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={subtask.is_completed}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                readOnly
              />
              <span className="ml-2 text-sm text-gray-700">
                {subtask.is_completed ? "Completed" : "Not completed"}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Created</div>
            <div className="text-sm text-gray-700">
              {new Date(subtask.created_at).toLocaleString()}
            </div>
          </div>

          {subtask.updated_at !== subtask.created_at && (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Last Updated</div>
              <div className="text-sm text-gray-700">
                {new Date(subtask.updated_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
