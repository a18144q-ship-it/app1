import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, Play, Pause, Square, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store';

export default function Focus() {
  const navigate = useNavigate();
  const [state, setState] = useAppStore();
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [taskName, setTaskName] = useState('深度工作：UI 设计');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskName, setEditTaskName] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempWorkDuration, setTempWorkDuration] = useState(workDuration);
  const [tempBreakDuration, setTempBreakDuration] = useState(breakDuration);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      const playBeep = (time: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, time); // A5 note
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.5);
      };

      // Play 3 quick beeps
      playBeep(ctx.currentTime);
      playBeep(ctx.currentTime + 0.25);
      playBeep(ctx.currentTime + 0.5);
      
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  };

  const toxicQuotes = [
    "盯着我看干嘛？看我能让你变聪明吗？🙄",
    "别看了，你的代码还是那么多bug。🐛",
    "时间在流逝，而你还在发呆。⏳",
    "你以为你在努力，其实只是在感动自己。🤡",
    "放下手机，不然这25分钟又白费了。📱",
    "专注点！你的竞争对手可没在休息。🔥"
  ];

  const totalTime = workDuration * 60;
  const timePercent = (totalTime - timeLeft) / totalTime;
  const progress = timePercent * 314.159;

  const getGradientColors = (percent: number) => {
    // Stop 1: #3b82f6 (59, 130, 246) -> #ef4444 (239, 68, 68)
    const r1 = Math.round(59 + (239 - 59) * percent);
    const g1 = Math.round(130 + (68 - 130) * percent);
    const b1 = Math.round(246 + (68 - 246) * percent);
    
    // Stop 2: #a855f7 (168, 85, 247) -> #ef4444 (239, 68, 68)
    const r2 = Math.round(168 + (239 - 168) * percent);
    const g2 = Math.round(85 + (68 - 85) * percent);
    const b2 = Math.round(247 + (68 - 247) * percent);
    
    return {
      stop1: `rgb(${r1}, ${g1}, ${b1})`,
      stop2: `rgb(${r2}, ${g2}, ${b2})`,
      stop3: '#ef4444'
    };
  };

  const gradientColors = getGradientColors(timePercent);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let quoteInterval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
      
      quoteInterval = setInterval(() => {
        setQuoteIndex((prev) => (prev + 1) % toxicQuotes.length);
      }, 8000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playChime();
      // Save focus session
      const newSession = {
        id: Date.now().toString(),
        duration: workDuration,
        date: new Date().toISOString().split('T')[0]
      };
      setState({ focusSessions: [...state.focusSessions, newSession] });
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (quoteInterval) clearInterval(quoteInterval);
    };
  }, [isActive, timeLeft, toxicQuotes.length]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(workDuration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startEditTask = () => {
    setEditTaskName(taskName);
    setIsEditingTask(true);
  };

  const saveTaskName = () => {
    if (editTaskName.trim()) {
      setTaskName(editTaskName);
    }
    setIsEditingTask(false);
  };

  const saveSettings = () => {
    setWorkDuration(tempWorkDuration);
    setBreakDuration(tempBreakDuration);
    setTimeLeft(tempWorkDuration * 60);
    setIsActive(false);
    setIsSettingsOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col min-h-full bg-white dark:bg-black pb-10"
    >
      <header className="flex items-center justify-between px-6 pb-4 pt-safe-4 md:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center size-10 rounded-full hover:bg-[#4cb2e6]/10 transition-colors cursor-pointer">
          <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">专注模式</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center size-10 rounded-full hover:bg-[#4cb2e6]/10 transition-colors cursor-pointer">
          <Settings className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="relative flex items-center justify-center w-72 h-72 md:w-80 md:h-80 mx-auto">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id="pomodoro-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors.stop1} className="transition-colors duration-1000" />
                <stop offset="50%" stopColor={gradientColors.stop2} className="transition-colors duration-1000" />
                <stop offset="100%" stopColor={gradientColors.stop3} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle
              className="text-slate-100 dark:text-slate-800"
              cx="60"
              cy="60"
              fill="none"
              r="50"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <circle
              className="transition-all duration-1000 ease-linear drop-shadow-lg"
              cx="60"
              cy="60"
              fill="none"
              r="50"
              stroke="url(#pomodoro-gradient)"
              strokeDasharray="314.159"
              strokeDashoffset={progress}
              strokeLinecap="round"
              strokeWidth="6"
              filter="url(#glow)"
            ></circle>
          </svg>
          <div className="flex flex-col items-center z-10 relative w-full px-8 text-center">
            <span className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-4">
              {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              番茄时间
            </span>
            <div className="h-12 mt-4 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.p
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-4 py-2 rounded-full shadow-sm"
                  >
                    {toxicQuotes[quoteIndex]}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center w-full max-w-xs">
          <p className="text-slate-400 text-sm mb-1 uppercase tracking-widest">
            当前任务
          </p>
          {isEditingTask ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <input
                autoFocus
                type="text"
                value={editTaskName}
                onChange={(e) => setEditTaskName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveTaskName()}
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-center text-lg font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#4cb2e6] outline-none w-full"
              />
              <button onClick={saveTaskName} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"><Check className="w-5 h-5" /></button>
              <button onClick={() => setIsEditingTask(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={startEditTask}>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {taskName}
              </h2>
              <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        <div className="mt-16 w-full max-w-xs flex flex-col gap-4">
          <button 
            onClick={toggleTimer}
            className={cn(
              "w-full font-bold h-14 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer",
              isActive 
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20" 
                : "bg-[#4cb2e6] hover:bg-[#4cb2e6]/90 text-white shadow-[#4cb2e6]/20"
            )}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>暂停专注</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{timeLeft < totalTime ? '继续专注' : '开始专注'}</span>
              </>
            )}
          </button>
          
          <button 
            onClick={resetTimer}
            className="w-full border-2 border-[#4cb2e6]/30 hover:border-[#4cb2e6]/50 text-[#4cb2e6] font-bold h-14 rounded-xl flex items-center justify-center transition-all cursor-pointer gap-2"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>重置</span>
          </button>
        </div>
      </main>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto md:w-full md:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl shadow-2xl z-50 p-6 border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">专注设置</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    专注时长 (分钟)
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="120"
                    value={tempWorkDuration}
                    onChange={(e) => setTempWorkDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#4cb2e6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    休息时长 (分钟)
                  </label>
                  <input 
                    type="number" 
                    min="1" 
                    max="30"
                    value={tempBreakDuration}
                    onChange={(e) => setTempBreakDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#4cb2e6] outline-none"
                  />
                </div>
                
                <button 
                  onClick={saveSettings}
                  className="w-full bg-[#4cb2e6] hover:bg-[#4cb2e6]/90 text-white font-bold h-12 rounded-xl transition-colors mt-4 cursor-pointer"
                >
                  保存设置
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
