import { useState } from 'react';
import { Search, ArrowRight, Sparkles, Moon, Sun, X, Copy, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useAppStore } from '../store';

const INSPIRATIONS = [
  {
    title: '极简主义排版',
    desc: '探索留白与字体的完美平衡，为你的下一个项目寻找灵感。',
    image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2564&auto=format&fit=crop',
    type: '灵感墙'
  },
  {
    title: '赛博朋克配色',
    desc: '高对比度霓虹色系，打造未来感十足的视觉体验。',
    image: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2564&auto=format&fit=crop',
    type: 'AI 提示词'
  },
  {
    title: '自然纹理材质',
    desc: '将真实的自然纹理融入数字设计，增加设计的呼吸感。',
    image: 'https://images.unsplash.com/photo-1505820013142-f86a3439c5b2?q=80&w=2564&auto=format&fit=crop',
    type: '灵感墙'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [state, setState] = useAppStore();
  
  // Helper to get daily index based on date string
  const getDailyIndex = (length: number) => {
    if (length <= 0) return 0;
    const seed = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % length;
  };

  const [dailyInspiration] = useState(() => INSPIRATIONS[getDailyIndex(INSPIRATIONS.length)]);
  const [dailyPrompt] = useState(() => {
    if (!state.prompts || state.prompts.length === 0) return null;
    return state.prompts[getDailyIndex(state.prompts.length)];
  });

  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const whitewashDays = state.consecutiveDays;
  const isInterrupted = state.lazyTitle === '试图自救的烂泥';
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = (state.tasks || []).filter(t => t.date === today);
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed').length;
  const pendingTodayTasks = todayTasks.length - completedTodayTasks;
  const todayProgress = todayTasks.length > 0 ? (completedTodayTasks / todayTasks.length) * 100 : 0;

  const handleInterrupt = () => {
    setState({ consecutiveDays: 0, lazyTitle: '试图自救的烂泥' });
  };

  const goToAI = (tab: 'record' | 'library' | 'assistant') => {
    setState({ aiActiveTab: tab });
    navigate('/ai');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-full bg-white dark:bg-black pb-20 md:pb-10"
    >
      <header className="flex items-center bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 pb-4 pt-safe-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 md:hidden">
        <button 
          onClick={toggleTheme}
          className="flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-full transition-all text-slate-600 dark:text-slate-400"
        >
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <button 
          onClick={() => navigate('/sync')}
          className="flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-full transition-all text-slate-600 dark:text-slate-400"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          自种自收
        </h1>
        <div className="relative flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={() => navigate('/stats')}>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          {/* Dog head accessory */}
          <div className="absolute -top-2 -right-2 text-xl animate-bounce">
            {isInterrupted ? '🧟' : state.lazyTitle === '正常人' ? '😎' : '🐶'}
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="flex flex-col gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl relative">
                {isInterrupted ? '🧟' : state.lazyTitle === '正常人' ? '😎' : '🐶'}
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-red-500"></span>
                </span>
              </span>
              <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">
                  {state.lazyTitle}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isInterrupted ? '洗白中断，烂泥扶不上墙。' : state.lazyTitle === '正常人' ? '干得不错，继续保持。' : '别装了，我知道你这三天都在刷短视频。'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleInterrupt}
              className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              模拟中断
            </button>
          </div>
          
          {/* Whitewash Progress */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">洗白进度 🧼</span>
              <span className="text-xs text-slate-500">{whitewashDays}/7 天</span>
            </div>
            <div className="flex gap-1 h-2">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-full transition-colors",
                    i < whitewashDays ? "bg-emerald-400" : "bg-slate-100 dark:bg-slate-800"
                  )}
                />
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              * 必须连续打卡 7 天且任务完成率 100% 才能摘下狗头
            </p>
          </div>

          {/* Today's Tasks */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">今日进行中任务</h3>
              <button onClick={() => navigate('/tasks')} className="text-xs text-[#4cb2e6] font-medium flex items-center gap-1">
                全部任务 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            {todayTasks.filter(t => t.status !== 'completed' && t.status !== 'waste').length > 0 ? (
              <div className="flex flex-col gap-2">
                {todayTasks.filter(t => t.status !== 'completed' && t.status !== 'waste').map(task => {
                  let progress = 0;
                  if (task.time && task.time.includes(':')) {
                    const [hours, minutes] = task.time.split(':').map(Number);
                    const taskMinutes = hours * 60 + (minutes || 0);
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    progress = currentMinutes >= taskMinutes ? 100 : (currentMinutes / taskMinutes) * 100;
                  }
                  
                  return (
                    <div key={task.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-1 bg-slate-100 dark:bg-slate-800 w-full">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={cn("h-full", progress >= 100 ? "bg-red-400" : "bg-[#4cb2e6]")}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{task.time}</p>
                        </div>
                        <div className="text-xs font-medium text-slate-400">
                          {progress >= 100 ? '已超时' : `${Math.round(progress)}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500">今日任务已全部搞定，去休息吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-2">
        <div className="px-4 py-2 flex items-center justify-between">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">
            每日发现
          </h3>
        </div>
        <div className="px-4">
          <div 
            onClick={() => setShowInspirationModal(true)}
            className="relative w-full h-40 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <img 
              src={dailyInspiration.image} 
              alt={dailyInspiration.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#4cb2e6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {dailyInspiration.type}
                </span>
              </div>
              <h4 className="text-white font-bold text-lg leading-tight mb-1">{dailyInspiration.title}</h4>
              <p className="text-white/80 text-xs line-clamp-1">{dailyInspiration.desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="px-4 py-2 flex items-center justify-between">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            每日提示词
          </h3>
          <button 
            onClick={() => navigate('/ai')}
            className="text-xs font-medium text-[#4cb2e6] hover:underline"
          >
            查看更多
          </button>
        </div>
        <div className="px-4">
          {dailyPrompt ? (
            <div 
              onClick={() => setShowPromptModal(true)}
              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-white bg-[#4cb2e6] px-2 py-0.5 rounded-full">
                  {dailyPrompt.tag}
                </span>
                <h4 className="text-slate-900 dark:text-white font-bold text-sm truncate">{dailyPrompt.title}</h4>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed italic">
                "{dailyPrompt.content}"
              </p>
              {dailyPrompt.images && dailyPrompt.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {dailyPrompt.images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <img src={img} alt="prompt preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm italic">
              提示词库空空如也...
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 mb-8">
        <div className="px-4 py-2">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
            近期项目
          </h3>
        </div>
        <div className="px-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-full h-24 bg-[#4cb2e6]/5 rounded-lg mb-2 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Project thumbnail"
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              电商 App 升级
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">更新于 2小时前</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2 overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Project thumbnail"
                src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?q=80&w=2564&auto=format&fit=crop"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              品牌视觉规范
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">更新于 昨天</p>
          </div>
        </div>
      </section>

      {/* Inspiration Modal */}
      <AnimatePresence>
        {showInspirationModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInspirationModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="relative h-64 shrink-0">
                <img 
                  src={dailyInspiration.image} 
                  alt={dailyInspiration.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setShowInspirationModal(false)}
                  className="absolute top-4 right-4 size-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#4cb2e6] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {dailyInspiration.type}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {dailyInspiration.title}
                </h2>
                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
                    {dailyInspiration.desc}
                  </p>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">设计要点</h5>
                    <ul className="space-y-2">
                      <li className="text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2">
                        <span className="text-[#4cb2e6] mt-1">•</span>
                        注重空间感与层级结构的清晰表达。
                      </li>
                      <li className="text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2">
                        <span className="text-[#4cb2e6] mt-1">•</span>
                        色彩运用需克制，强调核心视觉元素的张力。
                      </li>
                    </ul>
                  </div>
                </div>
                <button 
                  onClick={() => goToAI('record')}
                  className="w-full mt-8 py-4 bg-[#4cb2e6] text-white font-bold rounded-2xl shadow-lg shadow-[#4cb2e6]/20 hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  前往灵感库探索更多
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Prompt Modal */}
      <AnimatePresence>
        {showPromptModal && dailyPrompt && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPromptModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-[#4cb2e6]/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#4cb2e6]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">每日提示词详情</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{dailyPrompt.tag}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPromptModal(false)}
                  className="size-10 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full flex items-center justify-center transition-colors text-slate-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{dailyPrompt.title}</h3>
                
                <div className="relative group">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 font-mono text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{dailyPrompt.content}"
                  </div>
                  <button 
                    onClick={() => copyToClipboard(dailyPrompt.content)}
                    className="absolute top-3 right-3 p-2 bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-90 flex items-center gap-1.5 text-xs font-bold text-[#4cb2e6]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? '已复制' : '复制提示词'}
                  </button>
                </div>

                {dailyPrompt.images && dailyPrompt.images.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">参考图库</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {dailyPrompt.images.map((img, idx) => (
                        <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                          <img src={img} alt="reference" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => goToAI('library')}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    前往提示词库
                  </button>
                  <button 
                    onClick={() => copyToClipboard(dailyPrompt.content)}
                    className="flex-1 py-4 bg-[#4cb2e6] text-white font-bold rounded-2xl shadow-lg shadow-[#4cb2e6]/20 hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    立即复制使用
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
