import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Plus, Trash2, Edit2, Check, X, History, Calendar } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, Task, TaskCategory } from '../store';

export default function Tasks() {
  const navigate = useNavigate();
  const [state, setState] = useAppStore();
  const { tasks } = state;

  const [historyTasks] = useState<Task[]>([
    { id: 'h1', title: '首页视觉重构', status: 'completed', time: '18:00 PM', date: '昨天' },
    { id: 'h2', title: '用户调研报告', status: 'completed', time: '15:30 PM', date: '昨天' },
    { id: 'h3', title: '修复导航栏 Bug', status: 'completed', time: '11:00 AM', date: '前天' },
    { id: 'h4', title: '准备 Q3 规划会议', status: 'completed', time: '16:00 PM', date: '上周' },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTime, setEditTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('12:00');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('work');
  const [newTaskEndDate, setNewTaskEndDate] = useState('');
  const [isDaily, setIsDaily] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [showToxicConfirm, setShowToxicConfirm] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [currentToxicMessage, setCurrentToxicMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const todayElement = calendarRef.current.querySelector('[data-today="true"]');
      if (todayElement) {
        const containerWidth = calendarRef.current.offsetWidth;
        const elementLeft = (todayElement as HTMLElement).offsetLeft;
        const elementWidth = (todayElement as HTMLElement).offsetWidth;
        calendarRef.current.scrollLeft = elementLeft - containerWidth / 2 + elementWidth / 2;
      }
    }
  }, []);

  useEffect(() => {
    setNewTaskDate(selectedDate);
  }, [selectedDate]);

  const CATEGORY_INFO = {
    life: { icon: '🏠', label: '生活', alias: '维持生命体征的基本活动' },
    study: { icon: '📚', label: '学习', alias: '买书如山倒，读书如抽丝' },
    work: { icon: '💼', label: '工作', alias: '出卖灵魂与耐心的交易' },
  };

  const CATEGORY_COLORS = {
    life: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    study: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    work: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const getDeadlineColor = (date?: string, time?: string) => {
    if (!date || !time) return '#10b981'; // Default green
    
    const now = new Date();
    const deadline = new Date(`${date}T${time}`);
    
    const totalMs = 24 * 60 * 60 * 1000; // 24 hours range
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs <= 0) return '#ef4444'; // Red if overdue
    if (diffMs >= totalMs) return '#10b981'; // Green if > 24h away
    
    const ratio = 1 - (diffMs / totalMs);
    const r = Math.round(16 + (239 - 16) * ratio);
    const g = Math.round(185 + (68 - 185) * ratio);
    const b = Math.round(129 + (68 - 129) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleTaskStatus = (id: string) => {
    const task = (state.tasks || []).find(t => t.id === id);
    if (!task) return;

    if (task.status === 'completed') {
      // Uncompleting is simple
      const newTasks = (state.tasks || []).map(t => t.id === id ? { ...t, status: 'pending' } as Task : t);
      
      // If we uncomplete a task today, we should clear lastCompletionDate if it was today
      // so the user can get the completion dialog again when they complete all tasks.
      const today = new Date().toISOString().split('T')[0];
      if (state.lastCompletionDate === today && task.date === today) {
        // Find yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Decrement consecutive days if it was increased today
        const newConsecutiveDays = Math.max(0, state.consecutiveDays - 1);
        
        setState({ 
          tasks: newTasks,
          lastCompletionDate: yesterdayStr,
          consecutiveDays: newConsecutiveDays,
          lazyTitle: newConsecutiveDays < 7 ? '试图自救的烂泥' : '正常人'
        });
      } else {
        setState({ tasks: newTasks });
      }
    } else {
      // Completing triggers toxic confirm
      const toxicMessages = [
        "打了卡你就能变强吗？不，你只是感动了自己。🤡",
        "这种简单的任务也值得打卡？你是还没断奶的小宝宝需要奖励吗？🍼",
        "恭喜完成！现在的你，比起昨天的那个废物，稍微强了 0.0001%。🤏",
        "别点那么快，看看你的银行卡余额，你觉得这点努力够吗？💰",
        "确认完成了？别是为了逃避下一个任务在演戏吧？🎬",
        "这种程度的努力，在努力界只能算是个‘重在参与’。🥉"
      ];
      setCurrentToxicMessage(toxicMessages[Math.floor(Math.random() * toxicMessages.length)]);
      setPendingTaskId(id);
      setShowToxicConfirm(true);
    }
  };

  const confirmTaskCompletion = () => {
    if (!pendingTaskId) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newTasks = (state.tasks || []).map(t => t.id === pendingTaskId ? { ...t, status: 'completed' } as Task : t);
    setState({ tasks: newTasks });
    setShowToxicConfirm(false);
    setPendingTaskId(null);

    // Check if all today's tasks are completed
    const todayTasks = newTasks.filter(t => t.date === today);
    if (todayTasks.length > 0 && todayTasks.every(t => t.status === 'completed')) {
      if (state.lastCompletionDate !== today) {
        setShowCompletionDialog(true);
      }
    }
  };

  const confirmCompletion = () => {
    const today = new Date().toISOString().split('T')[0];
    let newConsecutiveDays = state.consecutiveDays;
    let newLazyTitle = state.lazyTitle;

    // Check if yesterday was completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (state.lastCompletionDate === yesterdayStr) {
      newConsecutiveDays += 1;
    } else if (state.lastCompletionDate !== today) {
      // Interrupted or first time
      newConsecutiveDays = 1;
      newLazyTitle = '试图自救的烂泥';
    }

    if (newConsecutiveDays >= 7) {
      newLazyTitle = '正常人';
      showToast("竟然连续7天完成了？算你有点毅力，【狗头挂件】已摘除。");
    }

    setState({
      lastCompletionDate: today,
      consecutiveDays: newConsecutiveDays,
      lazyTitle: newLazyTitle
    });
    
    setShowCompletionDialog(false);
  };

  const deleteTask = (id: string) => {
    setState({ tasks: (state.tasks || []).filter(t => t.id !== id) });
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditTime(task.time.includes(':') ? task.time : '12:00');
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      setState({ tasks: (state.tasks || []).map(t => t.id === id ? { ...t, title: editTitle, description: editDescription.trim() || undefined, time: editTime } : t) });
    }
    setEditingId(null);
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const start = new Date(newTaskDate);
      let end = newTaskEndDate ? new Date(newTaskEndDate) : new Date(newTaskDate);
      
      // If isDaily is true and no end date, default to 7 days
      if (isDaily && !newTaskEndDate) {
        end = new Date(start);
        end.setDate(start.getDate() + 6);
      }

      const newTasksToAdd: Task[] = [];
      let current = new Date(start);
      const actualEnd = end < start ? start : end;

      // Limit to 31 days to prevent accidental massive creation
      const maxDays = 31;
      let count = 0;

      while (current <= actualEnd && count < maxDays) {
        newTasksToAdd.push({
          id: `${Date.now()}-${count}-${Math.random().toString(36).substr(2, 9)}`,
          title: newTaskTitle,
          description: newTaskDescription.trim() || undefined,
          status: 'pending',
          time: newTaskTime,
          date: current.toISOString().split('T')[0],
          category: newTaskCategory,
        });
        current.setDate(current.getDate() + 1);
        count++;
      }

      setState({ tasks: [...(state.tasks || []), ...newTasksToAdd] });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskTime('12:00');
      setNewTaskEndDate('');
      setIsDaily(false);
      setIsAdding(false);
      showToast(`已成功添加 ${newTasksToAdd.length} 个任务`);
    }
  };

  const handleBatchSlack = () => {
    showToast("【批量摆烂】已标记为“法定废柴日”。毒舌提醒已暂停，积分已扣除。烂泥扶不上墙。");
    setShowMenu(false);
  };

  const clearCompleted = () => {
    setState({ tasks: (state.tasks || []).filter(t => t.status !== 'completed') });
    setShowMenu(false);
  };

  const openHistory = () => {
    setShowHistory(true);
    setShowMenu(false);
  };

  const renderTask = (task: Task) => {
    const isEditing = editingId === task.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        key={task.id}
        className={cn(
          "flex items-center gap-4 px-2 min-h-[72px] py-3 justify-between border-b border-slate-50 dark:border-slate-800/50 group",
          task.status === 'overdue' ? "bg-red-50/30 dark:bg-red-900/10 rounded-xl border border-red-100/50 dark:border-red-900/20" : "bg-white dark:bg-black"
        )}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex size-6 items-center justify-center shrink-0">
            <input
              checked={task.status === 'completed'}
              onChange={() => toggleTaskStatus(task.id)}
              className={cn(
                "h-5 w-5 rounded border-2 bg-transparent focus:ring-offset-0 focus:outline-none cursor-pointer",
                task.status === 'overdue' ? "border-red-200 dark:border-red-800 text-red-400 focus:ring-red-400" : "border-slate-300 dark:border-slate-600 text-[#4cb2e6] focus:ring-[#4cb2e6]"
              )}
              type="checkbox"
            />
          </div>
          <div className="flex flex-col justify-center flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                  placeholder="任务标题"
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-sm focus:ring-2 focus:ring-[#4cb2e6]"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="二级文字内容（可选）"
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-xs focus:ring-2 focus:ring-[#4cb2e6] resize-none"
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-xs focus:ring-2 focus:ring-[#4cb2e6] text-slate-600 dark:text-slate-300"
                  />
                  <div className="flex-1"></div>
                  <button onClick={() => saveEdit(task.id)} className="text-emerald-500 p-1"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span 
                    className="size-2 rounded-full shrink-0" 
                    style={{ backgroundColor: getDeadlineColor(task.date, task.time) }} 
                  />
                  <p className={cn(
                    "text-base font-medium leading-normal line-clamp-1",
                    task.status === 'completed' ? "text-slate-400 line-through" : "text-slate-900 dark:text-white"
                  )}>
                    {task.title}
                  </p>
                </div>
                {task.description && (
                  <p className={cn(
                    "text-xs mt-1 line-clamp-2 pl-4",
                    task.status === 'completed' ? "text-slate-400/60 line-through" : "text-slate-500 dark:text-slate-400"
                  )}>
                    {task.description}
                  </p>
                )}
                {task.category && (
                  <span 
                    className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium w-fit mt-1", CATEGORY_COLORS[task.category])} 
                    title={CATEGORY_INFO[task.category].alias}
                  >
                    {CATEGORY_INFO[task.category].icon} {CATEGORY_INFO[task.category].label}
                  </span>
                )}
                {task.status === 'in-progress' && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="flex size-2 rounded-full bg-[#4cb2e6]/60"></span>
                    <p className="text-[#4cb2e6] text-xs font-medium leading-normal">进行中</p>
                  </div>
                )}
                {task.status === 'completed' && (
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-normal leading-normal">已完成</p>
                )}
                {task.status === 'pending' && (
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-normal leading-normal">待开始</p>
                )}
                {task.isLazy && (
                  <div className="flex items-center gap-1.5 mt-0.5 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full w-fit">
                    <span className="text-[10px]">🐶</span>
                    <p className="text-red-500 dark:text-red-400 text-xs font-bold leading-normal">懒狗模式</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => startEdit(task)} className="p-1.5 text-slate-400 hover:text-[#4cb2e6]"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => deleteTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className={cn(
              "text-sm font-normal",
              task.status === 'overdue' ? "text-red-400 font-medium" : "text-slate-400"
            )}>
              {task.time}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col min-h-full bg-white dark:bg-black pb-24 md:pb-10 relative"
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 left-4 right-4 z-50 bg-slate-900 dark:bg-slate-100 border border-slate-800 dark:border-slate-200 p-4 rounded-xl shadow-xl flex items-start gap-3"
          >
            <span className="text-2xl shrink-0">😈</span>
            <p className="text-sm font-bold text-white dark:text-slate-900 leading-relaxed">
              {toastMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToxicConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[70] p-8 border border-red-100 dark:border-red-900/30 text-center"
            >
              <div className="text-4xl mb-4">😈</div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 leading-tight">
                {currentToxicMessage}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                你真的确定这个任务已经“完美”结束了吗？
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmTaskCompletion}
                  className="w-full py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                >
                  确定（我就是这么菜）
                </button>
                <button 
                  onClick={() => { setShowToxicConfirm(false); setPendingTaskId(null); }}
                  className="w-full py-4 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  我再检查一下...
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletionDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 p-6 border border-slate-100 dark:border-slate-800 text-center"
            >
              <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">竟然真的全做完了？🤡</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                别以为这样就能改变你是废柴的事实。确认打卡以领取你那微不足道的虚荣心奖励。
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCompletionDialog(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  我再演会儿
                </button>
                <button 
                  onClick={confirmCompletion}
                  className="flex-1 py-3 rounded-xl font-black text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  确认打卡（领赏）
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <header className="flex items-center bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 pb-4 pt-safe-4 border-b border-slate-100 dark:border-slate-800 justify-between sticky top-0 z-10 md:hidden">
        <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-white flex size-10 items-center justify-center cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center flex items-center justify-center gap-2">
          我的任务
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Calendar className="w-4 h-4 text-[#4cb2e6]" />
          </div>
        </h2>
        <div className="relative flex w-10 items-center justify-end">
          <button 
            onClick={() => setShowMenu(!showMenu)} 
            className="flex items-center justify-center rounded-lg h-10 w-10 bg-transparent text-slate-900 dark:text-white p-0 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreHorizontal className="w-6 h-6" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-12 right-0 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
              >
                <button 
                  onClick={openHistory} 
                  className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  历史记录
                </button>
                <button 
                  onClick={handleBatchSlack} 
                  className="w-full text-left px-4 py-3 text-sm text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  批量摆烂
                </button>
                <button 
                  onClick={clearCompleted} 
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                  清除已完成
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Weekly Calendar Strip */}
      <div 
        ref={calendarRef}
        className="bg-white dark:bg-black border-b border-slate-100 dark:border-slate-800 px-4 py-3 overflow-x-auto no-scrollbar scroll-smooth"
      >
        <div className="flex gap-3 min-w-max">
          {Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 15 + i); // Show 15 days before and 14 days after today
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const isToday = date.toDateString() === new Date().toDateString();
            const dayStr = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(dateStr)} 
                data-today={isToday}
                className={cn(
                  "flex flex-col items-center justify-center w-10 h-14 rounded-xl cursor-pointer transition-colors relative shrink-0",
                  isSelected ? "bg-[#4cb2e6] text-white shadow-md shadow-[#4cb2e6]/20" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <span className={cn("text-[10px] font-medium mb-1", isSelected ? "text-white/80" : "text-slate-400")}>{dayStr}</span>
                <span className={cn("text-sm font-bold", isSelected ? "text-white" : "text-slate-700 dark:text-slate-200")}>{date.getDate()}</span>
                {isToday && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#4cb2e6]"></span>}
              </div>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-2">
            今日待办
          </h3>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {(state.tasks || []).filter(t => t.date === selectedDate && t.status !== 'completed').map(renderTask)}
            </AnimatePresence>
            {(state.tasks || []).filter(t => t.date === selectedDate && t.status !== 'completed').length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">当前日期没有待办任务</p>
            )}
          </div>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight mb-2">
            收工
          </h3>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {(state.tasks || []).filter(t => t.date === selectedDate && t.status === 'completed').map(renderTask)}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-20"
          >
            <div className="flex flex-col gap-3">
              <input
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="输入新任务标题..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#4cb2e6] outline-none"
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="二级文字内容（例如：具体步骤、备注等，可选）..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#4cb2e6] outline-none resize-none min-h-[60px]"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">分类:</span>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                    className="bg-transparent border-none text-sm focus:ring-0 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="work">💼 工作</option>
                    <option value="study">📚 学习</option>
                    <option value="life">🏠 生活</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">开始:</span>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">结束:</span>
                  <input
                    type="date"
                    value={newTaskEndDate}
                    onChange={(e) => setNewTaskEndDate(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">时间:</span>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <button 
                  onClick={() => setIsDaily(!isDaily)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    isDaily ? "bg-[#4cb2e6] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}
                >
                  <History className="w-3 h-3" />
                  每日重复
                </button>
                <div className="flex-1"></div>
                <button onClick={addTask} className="bg-[#4cb2e6] text-white p-2 rounded-lg cursor-pointer">
                  <Check className="w-5 h-5" />
                </button>
                <button onClick={() => setIsAdding(false)} className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-2 rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed bottom-0 left-0 right-0 h-[80vh] bg-white dark:bg-black z-50 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">历史记录</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {historyTasks.map((task, index) => {
                  const showDateHeader = index === 0 || historyTasks[index - 1].date !== task.date;
                  return (
                    <div key={task.id}>
                      {showDateHeader && (
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-4 mb-2 px-2">
                          {task.date}
                        </h3>
                      )}
                      <div className="flex items-center gap-4 px-2 py-3 border-b border-slate-50 dark:border-slate-800/50">
                        <div className="flex size-6 items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <p className="text-base font-medium text-slate-500 line-through">
                            {task.title}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {task.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-10">
        <button 
          onClick={() => setIsAdding(true)}
          className="flex size-14 items-center justify-center rounded-full bg-[#4cb2e6] text-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </motion.div>
  );
}
