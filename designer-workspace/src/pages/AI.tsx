import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Plus, Image as ImageIcon, Link2, Tag, MoreHorizontal, Copy, Menu, User, Zap, Eye, Archive, ArrowLeft, Trash2, Edit2, Check, X, Pin } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

import { useAppStore, Record, RecordBlock, Prompt, Chore } from '../store';

export default function AI() {
  const navigate = useNavigate();
  const [state, setState] = useAppStore();
  const { aiActiveTab } = state;
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const setActiveTab = (tab: 'record' | 'library' | 'assistant') => {
    setState({ aiActiveTab: tab });
  };

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return { records: [], prompts: [], chores: [] };
    const q = searchQuery.toLowerCase();
    return {
      records: (state.records || []).filter(r => 
        r.title?.toLowerCase().includes(q) || 
        r.blocks.some(b => b.type === 'text' && b.content.toLowerCase().includes(q)) ||
        r.tags?.some(t => t.toLowerCase().includes(q))
      ),
      prompts: (state.prompts || []).filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
      ),
      chores: (state.chores || []).filter(c => 
        c.text.toLowerCase().includes(q)
      )
    };
  }, [searchQuery, state.records, state.prompts, state.chores]);

  const handleResultClick = (tab: 'record' | 'library' | 'assistant', id: string) => {
    setShowSearch(false);
    setSearchQuery('');
    setActiveTab(tab);
    
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-[#4cb2e6]', 'ring-offset-2', 'dark:ring-offset-black', 'transition-shadow', 'duration-500');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#4cb2e6]', 'ring-offset-2', 'dark:ring-offset-black');
        }, 2000);
      }
    }, 150);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-full bg-slate-50 dark:bg-black pb-24"
    >
      <header className="sticky top-0 z-10 flex items-center bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 pb-4 pt-safe-4 justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-slate-100 flex size-8 items-center justify-center cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Sparkles className="w-6 h-6 text-[#4cb2e6]" />
          <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
            {aiActiveTab === 'record' ? '灵感记录' : aiActiveTab === 'library' ? 'AI 提示词库' : '日常琐事'}
          </h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSearch(true)}
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-black">
        <button
          onClick={() => setActiveTab('record')}
          className={cn(
            "px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer",
            aiActiveTab === 'record' ? "border-[#4cb2e6] text-[#4cb2e6]" : "border-transparent text-slate-500"
          )}
        >
          灵感记录
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            "px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer",
            aiActiveTab === 'library' ? "border-[#4cb2e6] text-[#4cb2e6]" : "border-transparent text-slate-500"
          )}
        >
          提示词库
        </button>
        <button
          onClick={() => setActiveTab('assistant')}
          className={cn(
            "px-4 py-2 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer",
            aiActiveTab === 'assistant' ? "border-[#4cb2e6] text-[#4cb2e6]" : "border-transparent text-slate-500"
          )}
        >
          日常琐事
        </button>
      </div>

      <main className="flex-1 p-4">
        {aiActiveTab === 'record' && <InspirationRecord state={state} setState={setState} />}
        {aiActiveTab === 'library' && <PromptLibrary state={state} setState={setState} />}
        {aiActiveTab === 'assistant' && <DailyChores state={state} setState={setState} />}
      </main>

      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-4 right-4 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[70vh] border border-slate-100 dark:border-slate-800"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索灵感、提示词、琐事..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
                <button onClick={() => setShowSearch(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {!searchQuery.trim() ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    输入关键字开始搜索
                  </div>
                ) : searchResults.records.length === 0 && searchResults.prompts.length === 0 && searchResults.chores.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    没有找到相关内容
                  </div>
                ) : (
                  <div className="space-y-4 p-2">
                    {searchResults.records.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">灵感记录</h4>
                        <div className="space-y-1">
                          {searchResults.records.map(r => (
                            <div 
                              key={r.id} 
                              onClick={() => handleResultClick('record', `record-${r.id}`)}
                              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                            >
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{r.title || '无标题灵感'}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">
                                {r.blocks.find(b => b.type === 'text')?.content || '包含图片内容'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {searchResults.prompts.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">提示词</h4>
                        <div className="space-y-1">
                          {searchResults.prompts.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => handleResultClick('library', `prompt-${p.id}`)}
                              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-[#4cb2e6]/10 text-[#4cb2e6] px-1.5 py-0.5 rounded font-bold">{p.tag}</span>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{p.title}</p>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1 italic">"{p.content}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {searchResults.chores.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">日常琐事</h4>
                        <div className="space-y-1">
                          {searchResults.chores.map(c => (
                            <div 
                              key={c.id} 
                              onClick={() => handleResultClick('assistant', `chore-${c.id}`)}
                              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors flex items-center gap-2"
                            >
                              <div className={cn("size-2 rounded-full", c.completed ? "bg-emerald-400" : "bg-[#4cb2e6]")} />
                              <p className={cn("text-sm", c.completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100")}>{c.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InspirationRecord({ state, setState }: { state: any, setState: any }) {
  const records = state.records || [];
  const [draftBlocks, setDraftBlocks] = useState<RecordBlock[]>([{ id: `b-${Date.now()}-${Math.random()}`, type: 'text', content: '' }]);
  const [newTitle, setNewTitle] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [tagInputValue, setTagInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBlocks, setEditBlocks] = useState<RecordBlock[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addRecord = () => {
    const validBlocks = draftBlocks.filter(b => b.type === 'image' || (b.type === 'text' && b.content && b.content.trim() !== ''));
    if (validBlocks.length === 0 && !newTitle.trim()) {
      showToast("请输入内容或上传图片后再发布哦！");
      return;
    }

    const newRecord: Record = {
      id: Date.now().toString(),
      title: newTitle.trim() || undefined,
      blocks: validBlocks,
      date: new Date().toISOString().split('T')[0],
      tags: newTags.length > 0 ? newTags : undefined,
      link: newLink || undefined,
    };
    
    // Use state.records directly to avoid any closure issues and ensure it's an array
    const currentRecords = state.records || [];
    setState({ records: [newRecord, ...currentRecords] });
    
    setDraftBlocks([{ id: `b-${Date.now()}-${Math.random()}`, type: 'text', content: '' }]);
    setNewTitle('');
    setNewTags([]);
    setNewLink('');
    setShowTagInput(false);
    setShowLinkInput(false);
    showToast("发布成功！✨");
  };

  const deleteRecord = (id: string) => {
    setState({ records: (state.records || []).filter((r: Record) => r.id !== id) });
  };

  const startEdit = (record: Record) => {
    setEditingId(record.id);
    setEditBlocks([...record.blocks]);
  };

  const saveEdit = (id: string) => {
    const validBlocks = editBlocks.filter(b => b.type === 'image' || (b.content && b.content.trim() !== ''));
    if (validBlocks.length === 0) {
      deleteRecord(id);
    } else {
      setState({ records: (state.records || []).map((r: Record) => r.id === id ? { ...r, blocks: validBlocks } : r) });
    }
    setEditingId(null);
  };

  const togglePin = (id: string) => {
    setState({ records: (state.records || []).map((r: Record) => r.id === id ? { ...r, isPinned: !r.isPinned } : r) });
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      const newBlocks: RecordBlock[] = [];
      let loadedCount = 0;
      filesArray.forEach((file: any, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newBlocks[index * 2] = { id: `b-${Date.now() + index}-${Math.random()}`, type: 'image', content: reader.result as string };
          newBlocks[index * 2 + 1] = { id: `b-${Date.now() + index + 0.5}-${Math.random()}`, type: 'text', content: '' };
          loadedCount++;
          if (loadedCount === filesArray.length) {
            setEditBlocks([...editBlocks, ...newBlocks]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      const newBlocks: RecordBlock[] = [];
      let loadedCount = 0;
      filesArray.forEach((file: any, index) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newBlocks[index * 2] = { id: `b-${Date.now() + index}-${Math.random()}`, type: 'image', content: reader.result as string };
          newBlocks[index * 2 + 1] = { id: `b-${Date.now() + index + 0.5}-${Math.random()}`, type: 'text', content: '' };
          loadedCount++;
          if (loadedCount === filesArray.length) {
            setDraftBlocks([...draftBlocks, ...newBlocks]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateDraftBlock = (id: string, content: string) => {
    setDraftBlocks(draftBlocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const updateEditBlock = (id: string, content: string) => {
    setEditBlocks(editBlocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeDraftBlock = (id: string) => {
    setDraftBlocks(draftBlocks.filter(b => b.id !== id));
  };

  const removeEditBlock = (id: string) => {
    setEditBlocks(editBlocks.filter(b => b.id !== id));
  };

  const handleAddTag = () => {
    if (tagInputValue.trim() && !newTags.includes(tagInputValue.trim())) {
      setNewTags([...newTags, tagInputValue.trim()]);
    }
    setTagInputValue('');
    setShowTagInput(false);
  };

  const sortedRecords = [...(state.records || [])].sort((a: Record, b: Record) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-50 bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 p-4 rounded-xl shadow-xl flex items-start gap-3"
          >
            <span className="text-2xl shrink-0">🤬</span>
            <p className="text-sm font-bold text-red-800 dark:text-red-100 leading-relaxed">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="px-4 pt-4">
          <input 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="灵感标题 (可选)"
            className="w-full bg-transparent border-none text-lg font-bold placeholder:text-slate-400 focus:ring-0 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="flex flex-col gap-3 p-4">
          {draftBlocks.map((block, idx) => (
            <div key={block.id} className="flex items-start gap-3 relative group">
              {idx === 0 && (
                <div className="size-10 shrink-0 rounded-full bg-[#4cb2e6]/10 flex items-center justify-center text-[#4cb2e6]">
                  <User className="w-5 h-5" />
                </div>
              )}
              {idx > 0 && <div className="w-10 shrink-0"></div>}
              
              {block.type === 'text' ? (
                <textarea
                  value={block.content}
                  onChange={(e) => updateDraftBlock(block.id, e.target.value)}
                  className="w-full min-h-[40px] border-none bg-transparent p-0 text-base placeholder:text-slate-400 focus:ring-0 resize-none text-slate-900 dark:text-slate-100 outline-none mt-2"
                  placeholder={idx === 0 ? "记录你的瞬间灵感..." : "添加文字说明..."}
                ></textarea>
              ) : (
                <div className="relative w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 mt-2">
                  <img src={block.content} alt="preview" className="w-full h-auto max-h-[300px] object-cover" />
                  <button onClick={() => removeDraftBlock(block.id)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-red-500 transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          {newTags.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pt-3">
              {newTags.map(tag => (
                <span key={tag} className="text-xs bg-[#4cb2e6]/10 text-[#4cb2e6] px-2 py-1 rounded flex items-center gap-1">
                  #{tag}
                  <button onClick={() => setNewTags(newTags.filter(t => t !== tag))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}
          {newLink && (
            <div className="px-4 pt-3 flex items-center gap-2 text-xs text-slate-500">
              <Link2 className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{newLink}</span>
              <button onClick={() => setNewLink('')} className="hover:text-red-500"><X className="w-3 h-3" /></button>
            </div>
          )}
          
          <AnimatePresence>
            {showTagInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pt-3 flex items-center gap-2">
                <input 
                  autoFocus
                  value={tagInputValue}
                  onChange={e => setTagInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                  placeholder="输入标签并回车"
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none focus:border-[#4cb2e6]"
                />
                <button onClick={handleAddTag} className="text-emerald-500"><Check className="w-4 h-4" /></button>
                <button onClick={() => setShowTagInput(false)} className="text-slate-400"><X className="w-4 h-4" /></button>
              </motion.div>
            )}
            {showLinkInput && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pt-3 flex items-center gap-2">
                <input 
                  autoFocus
                  value={newLink}
                  onChange={e => setNewLink(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setShowLinkInput(false)}
                  placeholder="输入链接"
                  className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none focus:border-[#4cb2e6]"
                />
                <button onClick={() => setShowLinkInput(false)} className="text-emerald-500"><Check className="w-4 h-4" /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              <label className="flex items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors cursor-pointer">
                <ImageIcon className="w-5 h-5" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
              <button onClick={() => { setShowLinkInput(!showLinkInput); setShowTagInput(false); }} className="flex items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <Link2 className="w-5 h-5" />
              </button>
              <button onClick={() => { setShowTagInput(!showTagInput); setShowLinkInput(false); }} className="flex items-center justify-center p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 transition-colors">
                <Tag className="w-5 h-5" />
              </button>
            </div>
            <button onClick={addRecord} className="rounded-lg bg-[#4cb2e6] px-5 py-1.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
              发布
            </button>
          </div>
        </div>
      </div>

      <div className="columns-2 gap-3 space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedRecords.map((record: Record) => {
            const imageBlocks = record.blocks.filter(b => b.type === 'image');
            const firstText = record.blocks.find(b => b.type === 'text' && b.content.trim() !== '');
            const isTextOnly = imageBlocks.length === 0;

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={record.id}
                id={`record-${record.id}`}
                className="break-inside-avoid group relative flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm scroll-mt-24"
              >
                {record.isPinned && (
                  <div className="absolute top-2 right-2 z-10 bg-[#4cb2e6] text-white p-1 rounded-full shadow-sm">
                    <Pin className="w-3 h-3 fill-current" />
                  </div>
                )}
                {imageBlocks.length > 0 && (
                  <div className="relative group/slider">
                    <div 
                      className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(record);
                      }}
                    >
                      {imageBlocks.map((block, bIdx) => (
                        <div key={block.id} className="min-w-full snap-center flex items-center justify-center relative">
                          <img
                            className="w-full h-auto max-h-[60vh] object-contain"
                            alt={record.title || 'Inspiration'}
                            src={block.content}
                            referrerPolicy="no-referrer"
                          />
                          {imageBlocks.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full font-bold z-10">
                              {bIdx + 1}/{imageBlocks.length}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {imageBlocks.length > 1 && (
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity">
                        <button 
                          className="size-6 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const slider = e.currentTarget.parentElement?.previousElementSibling;
                            if (slider) slider.scrollBy({ left: -slider.clientWidth, behavior: 'smooth' });
                          }}
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button 
                          className="size-6 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white rotate-180 pointer-events-auto cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const slider = e.currentTarget.parentElement?.previousElementSibling;
                            if (slider) slider.scrollBy({ left: slider.clientWidth, behavior: 'smooth' });
                          }}
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className={cn("p-3", isTextOnly && "bg-[#4cb2e6]/5")} onClick={() => setSelectedRecord(record)}>
                  {record.title && (
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1 cursor-pointer hover:text-[#4cb2e6] transition-colors">
                      {record.title}
                    </p>
                  )}
                  
                  {editingId === record.id ? (
                    <div className="flex flex-col gap-2 mt-2">
                      {editBlocks.map((block, idx) => (
                        <div key={block.id} className="flex flex-col gap-1 relative group/block">
                          {block.type === 'text' ? (
                            <textarea
                              value={block.content}
                              onChange={(e) => updateEditBlock(block.id, e.target.value)}
                              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded p-2 text-xs focus:ring-2 focus:ring-[#4cb2e6] outline-none resize-none"
                              rows={2}
                            />
                          ) : (
                            <div className="relative w-full rounded overflow-hidden border border-slate-200 dark:border-slate-700">
                              <img src={block.content} alt="preview" className="w-full h-auto object-cover" />
                              <button onClick={() => removeEditBlock(block.id)} className="absolute top-1 right-1 bg-black/50 text-white rounded p-1 hover:bg-red-500 transition-colors cursor-pointer opacity-0 group-hover/block:opacity-100">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center justify-between mt-1">
                        <label className="flex items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
                          <ImageIcon className="w-4 h-4" />
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
                        </label>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingId(null)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
                          <button onClick={() => saveEdit(record.id)} className="text-emerald-500 p-1"><Check className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    firstText && (
                      <p className={cn("text-xs leading-relaxed cursor-pointer", isTextOnly ? "text-slate-700 dark:text-slate-300 italic line-clamp-4" : "text-slate-500 line-clamp-2")} onClick={() => setSelectedRecord(record)}>
                        {firstText.content}
                      </p>
                    )
                  )}

                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {record.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {record.link && (
                    <a href={record.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 mt-2 text-[10px] text-[#4cb2e6] hover:underline truncate">
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{record.link}</span>
                    </a>
                  )}

                  {!editingId && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className={cn("text-[10px] font-medium uppercase tracking-wider", isTextOnly ? "text-[#4cb2e6] font-bold" : "text-slate-400")}>
                        {isTextOnly ? '摘录' : record.date}
                      </span>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button onClick={(e) => { e.stopPropagation(); togglePin(record.id); }} className={cn("p-1 hover:text-[#4cb2e6]", record.isPinned ? "text-[#4cb2e6]" : "text-slate-400")}>
                          <Pin className={cn("w-3 h-3", record.isPinned && "fill-current")} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(record); }} className="p-1 text-slate-400 hover:text-[#4cb2e6]"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteRecord(record.id); }} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  )}
                  
                  {isTextOnly && !editingId && (
                    <div className="mt-4 text-[10px] text-slate-400">{record.date}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedRecord.title || '灵感详情'}</h3>
                  <button onClick={() => togglePin(selectedRecord.id)} className={cn("p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800", selectedRecord.isPinned ? "text-[#4cb2e6]" : "text-slate-400")}>
                    <Pin className={cn("w-4 h-4", selectedRecord.isPinned && "fill-current")} />
                  </button>
                </div>
                <button onClick={() => setSelectedRecord(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-4 mb-4">
                {selectedRecord.blocks.map((block, idx) => (
                  <div key={block.id}>
                    {block.type === 'image' ? (
                      <div className="w-full rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                        <img
                          className="w-full h-auto max-h-[50vh] object-contain"
                          alt={selectedRecord.title || 'Inspiration'}
                          src={block.content}
                        />
                      </div>
                    ) : (
                      block.content.trim() !== '' && (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {block.content}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedRecord.tags?.map(tag => (
                  <span key={tag} className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
                {selectedRecord.link && (
                  <a href={selectedRecord.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full hover:underline">
                    <Link2 className="w-3 h-3 shrink-0" />
                    链接
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromptLibrary({ state, setState }: { state: any, setState: any }) {
  const prompts = state.prompts || [];
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startAdd = () => {
    setEditTitle('');
    setEditContent('');
    setEditTag('');
    setEditImages([]);
    setEditingId(null);
    setIsAdding(true);
  };

  const startEdit = (prompt: Prompt) => {
    setEditTitle(prompt.title);
    setEditContent(prompt.content);
    setEditTag(prompt.tag);
    setEditImages(prompt.images || []);
    setEditingId(prompt.id);
    setIsAdding(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImages([...editImages, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const savePrompt = () => {
    const title = editTitle.trim() || '未命名提示词';
    const content = editContent.trim() || '';
    
    if (!content && editImages.length === 0) {
      showToast("请输入提示词内容或上传图片！");
      return;
    }

    if (editingId) {
      setState({ prompts: (state.prompts || []).map((p: Prompt) => p.id === editingId ? { ...p, title, content, tag: editTag || 'General', images: editImages.length > 0 ? editImages : undefined } : p) });
      showToast("修改成功！✨");
    } else {
      setState({ prompts: [{
        id: `p-${Date.now()}-${Math.random()}`,
        title,
        content,
        tag: editTag || 'General',
        images: editImages.length > 0 ? editImages : undefined,
      }, ...(state.prompts || [])] });
      showToast("添加成功！✨");
    }
    setIsAdding(false);
  };

  const deletePrompt = (id: string) => {
    setState({ prompts: (state.prompts || []).filter((p: Prompt) => p.id !== id) });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-50 bg-emerald-50 dark:bg-emerald-900/90 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl shadow-xl flex items-start gap-3"
          >
            <span className="text-2xl shrink-0">✨</span>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-100 leading-relaxed">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAdding && (
        <button onClick={startAdd} className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-[#4cb2e6] hover:border-[#4cb2e6] hover:bg-[#4cb2e6]/5 transition-colors flex items-center justify-center gap-2 cursor-pointer">
          <Plus className="w-5 h-5" />
          <span>添加新提示词</span>
        </button>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-[#4cb2e6] shadow-sm space-y-3">
          {editImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {editImages.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button onClick={() => setEditImages(editImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input 
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="提示词标题"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-[#4cb2e6] outline-none text-slate-900 dark:text-slate-100"
          />
          <textarea 
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="输入 Prompt 内容..."
            rows={4}
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#4cb2e6] outline-none resize-none text-slate-900 dark:text-slate-100"
          />
          <input 
            value={editTag}
            onChange={e => setEditTag(e.target.value)}
            placeholder="标签 (如: 3D Render)"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#4cb2e6] outline-none text-slate-900 dark:text-slate-100"
          />
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">取消</button>
              <button onClick={savePrompt} className="px-4 py-2 text-sm bg-[#4cb2e6] text-white rounded-lg hover:bg-[#4cb2e6]/90 transition-colors cursor-pointer">保存</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {prompts.map(prompt => (
            <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={prompt.id} id={`prompt-${prompt.id}`} className="bg-white dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm group scroll-mt-24">
              <div className="flex flex-col p-4 gap-4">
                {prompt.images && prompt.images.length > 0 && (
                  <div 
                    className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    {prompt.images.map((img, idx) => (
                      <div key={idx} className="min-w-full snap-center flex items-center justify-center h-40 relative">
                        <img
                          className="w-full h-full object-cover"
                          alt={prompt.title}
                          src={img}
                        />
                        {prompt.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {idx + 1}/{prompt.images.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between" onClick={() => setSelectedPrompt(prompt)}>
                  <div className="cursor-pointer">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-[#4cb2e6] transition-colors">{prompt.title}</h3>
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(prompt); }} className="p-1 text-slate-400 hover:text-[#4cb2e6] cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic line-clamp-2">
                      {prompt.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] px-2 py-0.5 bg-[#4cb2e6]/10 text-[#4cb2e6] rounded-full uppercase font-bold">{prompt.tag}</span>
                    <button onClick={(e) => { e.stopPropagation(); copyToClipboard(prompt.content); }} className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4cb2e6] text-white text-sm font-semibold rounded-lg hover:bg-[#4cb2e6]/90 transition-colors shadow-sm cursor-pointer">
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPrompt(null)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedPrompt.title}</h3>
                <button onClick={() => setSelectedPrompt(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {selectedPrompt.images && selectedPrompt.images.length > 0 && (
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar w-full bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
                  {selectedPrompt.images.map((img, idx) => (
                    <div key={idx} className="min-w-full snap-center flex items-center justify-center">
                      <img
                        className="w-full h-auto max-h-[40vh] object-contain"
                        alt={selectedPrompt.title}
                        src={img}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedPrompt.content}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#4cb2e6] bg-[#4cb2e6]/10 px-2 py-1 rounded-full">
                  {selectedPrompt.tag}
                </span>
                <button onClick={() => {
                  navigator.clipboard.writeText(selectedPrompt.content);
                  setSelectedPrompt(null);
                }} className="flex items-center gap-1 text-xs font-bold text-white bg-[#4cb2e6] px-3 py-1.5 rounded-lg hover:bg-[#4cb2e6]/90 transition-colors">
                  <Copy className="w-3 h-3" />
                  复制
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DailyChores({ state, setState }: { state: any, setState: any }) {
  const chores = state.chores || [];
  const [newChore, setNewChore] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addChore = () => {
    if (newChore.trim()) {
      setState({ chores: [{ id: `c-${Date.now()}-${Math.random()}`, text: newChore, completed: false }, ...(state.chores || [])] });
      setNewChore('');
      showToast("添加成功！✨");
    } else {
      showToast("请输入琐事内容！");
    }
  };

  const toggleChore = (id: string) => {
    setState({ chores: chores.map((c: Chore) => c.id === id ? { ...c, completed: !c.completed } : c) });
  };

  const deleteChore = (id: string) => {
    setState({ chores: chores.filter((c: Chore) => c.id !== id) });
  };

  return (
    <div className="space-y-4 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-50 bg-emerald-50 dark:bg-emerald-900/90 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl shadow-xl flex items-start gap-3"
          >
            <span className="text-2xl shrink-0">✨</span>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-100 leading-relaxed">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-sm">
        <input
          value={newChore}
          onChange={(e) => setNewChore(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addChore()}
          placeholder="添加日常琐事..."
          className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:ring-0 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />
        <button 
          onClick={addChore}
          className="flex items-center justify-center size-10 bg-[#4cb2e6] text-white rounded-lg hover:bg-[#4cb2e6]/90 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {chores.map(chore => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={chore.id}
              id={`chore-${chore.id}`}
              className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl group scroll-mt-24"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={chore.completed}
                  onChange={() => toggleChore(chore.id)}
                  className="size-5 rounded border-slate-300 dark:border-slate-600 text-[#4cb2e6] focus:ring-[#4cb2e6] focus:ring-offset-0 bg-transparent transition-all cursor-pointer"
                />
                <span className={cn("text-sm transition-colors", chore.completed ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-200")}>
                  {chore.text}
                </span>
              </div>
              <button 
                onClick={() => deleteChore(chore.id)}
                className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {chores.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            暂无琐事，去享受生活吧！
          </div>
        )}
      </div>
    </div>
  );
}
