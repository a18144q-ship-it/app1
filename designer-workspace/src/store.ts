import { useState, useEffect, useSyncExternalStore } from 'react';

export type TaskCategory = 'life' | 'study' | 'work';

export type Task = {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'overdue' | 'pending';
  time: string;
  isLazy?: boolean;
  date?: string;
  category?: TaskCategory;
};

export type FocusSession = {
  id: string;
  duration: number; // in minutes
  date: string;
};

export type RecordBlock = {
  id: string;
  type: 'text' | 'image';
  content: string;
};

export type Record = {
  id: string;
  blocks: RecordBlock[];
  title?: string;
  date: string;
  tags?: string[];
  link?: string;
  isPinned?: boolean;
};

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tag: string;
  images?: string[];
};

export type Chore = {
  id: string;
  text: string;
  completed: boolean;
};

export type AppState = {
  tasks: Task[];
  focusSessions: FocusSession[];
  consecutiveDays: number;
  lastCompletionDate: string | null;
  lazyTitle: string;
  records: Record[];
  prompts: Prompt[];
  chores: Chore[];
  aiActiveTab: 'record' | 'library' | 'assistant';
};

const defaultState: AppState = {
  tasks: [
    { id: '1', title: '完成周报撰写', status: 'completed', time: '10:00 AM', category: 'work', date: new Date().toISOString().split('T')[0] },
    { id: '2', title: '设计系统审查', status: 'in-progress', time: '14:00 PM', category: 'work', date: new Date().toISOString().split('T')[0] },
    { id: '3', title: '更新产品路线图', status: 'overdue', time: '逾期', isLazy: true, category: 'work', date: new Date().toISOString().split('T')[0] },
    { id: '4', title: '部门团建方案', status: 'pending', time: '17:30 PM', category: 'life', date: new Date().toISOString().split('T')[0] },
    { id: '5', title: '背 50 个单词', status: 'pending', time: '20:00 PM', category: 'study', date: new Date().toISOString().split('T')[0] },
  ],
  focusSessions: [
    { id: 'f1', duration: 25, date: new Date().toISOString().split('T')[0] },
    { id: 'f2', duration: 25, date: new Date().toISOString().split('T')[0] },
  ],
  consecutiveDays: 0,
  lastCompletionDate: null,
  lazyTitle: '懒狗',
  records: [
    {
      id: '1',
      title: '极简建筑线条研究',
      blocks: [
        { id: 'b1', type: 'image', content: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2564&auto=format&fit=crop' },
        { id: 'b2', type: 'text', content: '这种几何结构的透视感非常有张力，可以运用在UI排版中。' }
      ],
      date: '2023-11-05'
    },
    {
      id: '2',
      blocks: [
        { id: 'b3', type: 'text', content: '“设计不仅是关于如何看，更是关于如何去感受。每一个像素背后都应该有一个为了解决问题而存在的故事。”' }
      ],
      date: '2023-11-04'
    },
    {
      id: '3',
      title: '配色方案：莫兰迪2.0',
      blocks: [
        { id: 'b4', type: 'image', content: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2564&auto=format&fit=crop' }
      ],
      date: '2023-11-02'
    }
  ],
  prompts: [
    {
      id: '1',
      title: '莫兰迪色调静物',
      content: 'A high-quality 3D render of minimalist ceramic vases in Morandi color palette, soft natural lighting, elegant composition, 8k resolution.',
      tag: '3D Render',
      images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop']
    },
    {
      id: '2',
      title: '极简主义建筑摄影',
      content: 'Minimalist architecture photography, concrete walls, sharp shadows, clear blue sky, wide angle, cinematic lighting, ultra-minimalist style.',
      tag: 'Architecture',
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2564&auto=format&fit=crop']
    }
  ],
  chores: [
    { id: '1', text: '买牛奶和全麦面包', completed: false },
    { id: '2', text: '取快递（丰巢柜）', completed: true },
    { id: '3', text: '给绿萝浇水', completed: false },
    { id: '4', text: '回复房东微信', completed: false },
  ],
  aiActiveTab: 'record',
};

let globalState: AppState = { ...defaultState };

try {
  const saved = localStorage.getItem('app_state');
  if (saved) {
    globalState = { ...defaultState, ...JSON.parse(saved) };
  }
} catch (e) {}

const listeners = new Set<() => void>();

export const store = {
  getState: () => globalState,
  setState: (newState: Partial<AppState>) => {
    globalState = { ...globalState, ...newState };
    try {
      localStorage.setItem('app_state', JSON.stringify(globalState));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
    listeners.forEach(listener => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

export function useAppStore() {
  const state = useSyncExternalStore(store.subscribe, store.getState);
  return [state, store.setState] as const;
}
