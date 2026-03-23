import { useState, useEffect, useSyncExternalStore } from 'react';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

export type TaskCategory = 'life' | 'study' | 'work';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in-progress' | 'overdue' | 'pending' | 'waste';
  time: string;
  isLazy?: boolean;
  date?: string;
  category?: TaskCategory;
  groupId?: string;
  userId?: string;
};

export type FocusSession = {
  id: string;
  duration: number; // in minutes
  date: string;
  userId?: string;
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
  type?: 'record' | 'summary';
  userId?: string;
};

export type Prompt = {
  id: string;
  title: string;
  content: string;
  tag: string;
  images?: string[];
  userId?: string;
};

export type Chore = {
  id: string;
  text: string;
  completed: boolean;
  userId?: string;
};

export type AppState = {
  tasks: Task[];
  focusSessions: FocusSession[];
  consecutiveDays: number;
  lastCompletionDate: string | null;
  lazyTitle: string;
  records: Record[];
  summaries: Record[];
  prompts: Prompt[];
  chores: Chore[];
  aiActiveTab: 'record' | 'library' | 'assistant' | 'summary';
};

const defaultState: AppState = {
  tasks: [],
  focusSessions: [],
  consecutiveDays: 0,
  lastCompletionDate: null,
  lazyTitle: '懒狗',
  records: [],
  summaries: [],
  prompts: [],
  chores: [],
  aiActiveTab: 'record',
};

let globalState: AppState = { ...defaultState };

const listeners = new Set<() => void>();

export const store = {
  getState: () => globalState,
  setState: (newState: Partial<AppState>) => {
    globalState = { ...globalState, ...newState };
    
    // Sync scalar values to user profile if they changed
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const updates: any = {};
      if (newState.consecutiveDays !== undefined) updates.consecutiveDays = newState.consecutiveDays;
      if (newState.lastCompletionDate !== undefined) updates.lastCompletionDate = newState.lastCompletionDate;
      if (newState.lazyTitle !== undefined) updates.lazyTitle = newState.lazyTitle;
      if (newState.aiActiveTab !== undefined) updates.aiActiveTab = newState.aiActiveTab;
      
      if (Object.keys(updates).length > 0) {
        updateDoc(doc(db, 'users', uid), updates).catch(e => handleFirestoreError(e, OperationType.UPDATE, `users/${uid}`));
      }
    }
    
    listeners.forEach(listener => listener());
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  replaceState: (newState: AppState) => {
    globalState = { ...newState };
    listeners.forEach(listener => listener());
  },
  resetState: () => {
    globalState = { ...defaultState };
    listeners.forEach(listener => listener());
  }
};

export function useAppStore() {
  const state = useSyncExternalStore(store.subscribe, store.getState);
  return [state, store.setState] as const;
}

// Firebase helper functions for CRUD operations
export const fb = {
  addTask: async (task: Task) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/tasks`;
    try {
      await setDoc(doc(db, path, task.id), { ...task, userId: uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },
  updateTask: async (id: string, updates: Partial<Task>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/tasks`;
    try {
      await updateDoc(doc(db, path, id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },
  deleteTask: async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/tasks`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },
  
  addFocusSession: async (session: FocusSession) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/focusSessions`;
    try {
      await setDoc(doc(db, path, session.id), { ...session, userId: uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },
  
  addRecord: async (record: Record) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/records`;
    try {
      await setDoc(doc(db, path, record.id), { ...record, userId: uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },
  updateRecord: async (id: string, updates: Partial<Record>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/records`;
    try {
      await updateDoc(doc(db, path, id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },
  deleteRecord: async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/records`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },
  
  addPrompt: async (prompt: Prompt) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/prompts`;
    try {
      await setDoc(doc(db, path, prompt.id), { ...prompt, userId: uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },
  updatePrompt: async (id: string, updates: Partial<Prompt>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/prompts`;
    try {
      await updateDoc(doc(db, path, id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },
  deletePrompt: async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/prompts`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },
  
  addChore: async (chore: Chore) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/chores`;
    try {
      await setDoc(doc(db, path, chore.id), { ...chore, userId: uid });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },
  updateChore: async (id: string, updates: Partial<Chore>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/chores`;
    try {
      await updateDoc(doc(db, path, id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },
  deleteChore: async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/chores`;
    try {
      await deleteDoc(doc(db, path, id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};
