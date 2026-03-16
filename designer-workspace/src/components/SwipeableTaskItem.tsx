import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { Task } from '../store';

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
  const ACTIONS_WIDTH = 120;

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    if (isEditing) return;
    if (offset.x > 50 || velocity.x > 500) {
      animate(x, ACTIONS_WIDTH, { type: "spring", stiffness: 300, damping: 30 });
      setIsOpen(true);
    } else if (offset.x < -50 || velocity.x < -500) {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 30 });
      setIsOpen(false);
    } else {
      animate(x, isOpen ? ACTIONS_WIDTH : 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  };

  useEffect(() => {
    if (isEditing) {
      animate(x, 0);
      setIsOpen(false);
    }
  }, [isEditing, x]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative overflow-hidden w-full border-b border-slate-50 dark:border-slate-800/50"
    >
      <div className="absolute inset-y-0 left-0 flex items-center justify-start px-4 gap-2 bg-slate-50 dark:bg-slate-800/50 w-full">
        <button onClick={() => { setIsOpen(false); animate(x, 0); onEdit(); }} className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 active:scale-95 transition-transform">
          <Edit2 className="w-4 h-4" />
        </button>
        <button onClick={() => { setIsOpen(false); animate(x, 0); onDelete(); }} className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 active:scale-95 transition-transform">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <motion.div
        drag={isEditing ? false : "x"}
        dragConstraints={{ left: 0, right: ACTIONS_WIDTH }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative z-10 flex items-center gap-4 px-2 min-h-[72px] py-3 justify-between w-full",
          task.status === 'overdue' ? "bg-red-50 dark:bg-red-900/10" : "bg-white dark:bg-black"
        )}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
