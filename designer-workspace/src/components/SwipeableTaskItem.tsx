import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { Task } from '../store';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface SwipeableTaskItemProps {
  task: Task;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({ task, isEditing, onEdit, onDelete, children }) => {
  const x = useMotionValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.x < -50) {
      setIsOpen(true);
      animate(x, -120, { type: "spring", stiffness: 300, damping: 30 });
    } else {
      setIsOpen(false);
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
  };

  return (
    <div className="relative w-full border-b border-slate-50 dark:border-slate-800/50 overflow-hidden group">
      {/* Background Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center justify-end px-4 gap-2 bg-slate-50 dark:bg-slate-800/50 w-full z-0">
        <button 
          onClick={() => { closeMenu(); onEdit(); }} 
          className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 active:scale-95 transition-transform"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { closeMenu(); onDelete(); }} 
          className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 active:scale-95 transition-transform"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Draggable Content */}
      <motion.div
        style={{ x }}
        drag={isEditing ? false : "x"}
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        className={cn(
          "relative z-10 flex w-full items-center gap-4 px-2 min-h-[72px] py-3 justify-between transition-colors",
          task.status === 'overdue' ? "bg-red-50 dark:bg-red-900/10" : task.status === 'waste' ? "bg-slate-100 dark:bg-slate-800/50 opacity-60" : "bg-white dark:bg-black"
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};
