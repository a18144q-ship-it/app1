import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, PawPrint, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store';

export default function Stats() {
  const navigate = useNavigate();
  const [state] = useAppStore();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const completedTasks = state.tasks.filter(t => t.status === 'completed').length;
  const totalFocusTime = state.focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalTomatoes = state.focusSessions.length;
  
  const workTasks = state.tasks.filter(t => t.category === 'work').length;
  const lifeTasks = state.tasks.filter(t => t.category === 'life').length;
  const studyTasks = state.tasks.filter(t => t.category === 'study').length;
  const lazyTasks = state.tasks.filter(t => t.isLazy);
  const totalCategorized = workTasks + lifeTasks + studyTasks || 1; // avoid division by zero

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col min-h-full bg-white dark:bg-black pb-24"
    >
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10">
        <button onClick={() => navigate(-1)} className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-slate-900 dark:text-white">
          数据统计
        </h2>
        <div className="flex w-12 items-center justify-end">
        </div>
      </div>

      <div className="px-4">
        <div className="flex border-b border-slate-100 dark:border-slate-800 justify-between">
          <button 
            onClick={() => setActiveTab('daily')}
            className={cn("flex flex-col items-center justify-center border-b-2 pb-3 pt-4 flex-1 transition-colors", activeTab === 'daily' ? "border-[#4cb2e6] text-[#4cb2e6]" : "border-transparent text-slate-400")}
          >
            <p className="text-sm font-bold leading-normal">每日</p>
          </button>
          <button 
            onClick={() => setActiveTab('weekly')}
            className={cn("flex flex-col items-center justify-center border-b-2 pb-3 pt-4 flex-1 transition-colors", activeTab === 'weekly' ? "border-[#4cb2e6] text-[#4cb2e6]" : "border-transparent text-slate-400")}
          >
            <p className="text-sm font-bold leading-normal">每周</p>
          </button>
          <button 
            onClick={() => setActiveTab('monthly')}
            className={cn("flex flex-col items-center justify-center border-b-2 pb-3 pt-4 flex-1 transition-colors", activeTab === 'monthly' ? "border-[#4cb2e6] text-[#4cb2e6]" : "border-transparent text-slate-400")}
          >
            <p className="text-sm font-bold leading-normal">每月</p>
          </button>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-[#4cb2e6]/10 dark:bg-[#4cb2e6]/20 p-6 rounded-xl flex flex-col gap-1">
          <p className="text-sm font-medium text-[#4cb2e6] uppercase tracking-wider">
            总完成任务
          </p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {completedTasks}
            </p>
            <p className="text-sm font-medium text-emerald-500 mb-1">
              连续 {state.consecutiveDays} 天
            </p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">专注时长</p>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
            {(totalFocusTime / 60).toFixed(1)}h
          </p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">番茄钟数</p>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
            {totalTomatoes} 个
          </p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">时间分布</h3>
          <span className="text-xs text-slate-400">
            {activeTab === 'daily' ? '今日' : activeTab === 'weekly' ? '最近 7 天' : '本月'}
          </span>
        </div>
        <div className="flex items-end justify-between h-32 gap-2 px-2">
          {activeTab === 'daily' ? (
            <>
              <div className="flex-1 bg-[#4cb2e6]/20 rounded-t-lg h-1/4"></div>
              <div className="flex-1 bg-[#4cb2e6]/40 rounded-t-lg h-1/2"></div>
              <div className="flex-1 bg-[#4cb2e6]/80 rounded-t-lg h-full"></div>
              <div className="flex-1 bg-[#4cb2e6]/30 rounded-t-lg h-1/3"></div>
            </>
          ) : activeTab === 'weekly' ? (
            <>
              <div className="flex-1 bg-[#4cb2e6]/20 rounded-t-lg h-2/3"></div>
              <div className="flex-1 bg-[#4cb2e6]/40 rounded-t-lg h-1/2"></div>
              <div className="flex-1 bg-[#4cb2e6]/30 rounded-t-lg h-3/4"></div>
              <div className="flex-1 bg-[#4cb2e6]/60 rounded-t-lg h-full"></div>
              <div className="flex-1 bg-[#4cb2e6]/40 rounded-t-lg h-2/3"></div>
              <div className="flex-1 bg-[#4cb2e6]/20 rounded-t-lg h-1/3"></div>
              <div className="flex-1 bg-[#4cb2e6]/50 rounded-t-lg h-1/2"></div>
            </>
          ) : (
            <>
              <div className="flex-1 bg-[#4cb2e6]/30 rounded-t-lg h-1/2"></div>
              <div className="flex-1 bg-[#4cb2e6]/60 rounded-t-lg h-3/4"></div>
              <div className="flex-1 bg-[#4cb2e6]/40 rounded-t-lg h-2/3"></div>
              <div className="flex-1 bg-[#4cb2e6]/80 rounded-t-lg h-full"></div>
            </>
          )}
        </div>
        <div className="flex justify-between mt-2 px-1 text-[10px] text-slate-400 uppercase">
          {activeTab === 'daily' ? (
            <><span>早</span><span>中</span><span>晚</span><span>夜</span></>
          ) : activeTab === 'weekly' ? (
            <><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span></>
          ) : (
            <><span>第一周</span><span>第二周</span><span>第三周</span><span>第四周</span></>
          )}
        </div>
      </div>

      <div className="m-4 p-5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-lg">
            <PawPrint className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-orange-900 dark:text-orange-200">
              懒狗记录统计
            </h3>
            <p className="text-xs text-orange-700/70 dark:text-orange-300/60">
              {lazyTasks.length > 0 
                ? `目前共有 ${lazyTasks.length} 个任务被标记为“懒狗模式”` 
                : '目前没有任务处于“懒狗模式”，算你识相。'}
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {lazyTasks.length > 0 ? (
            lazyTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🐶</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</span>
                </div>
                <span className="text-xs bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-200 px-2 py-0.5 rounded-full">
                  {task.status === 'overdue' ? '已逾期' : '待处理'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-orange-800/50 text-xs italic">
              暂无懒狗记录，继续保持你的勤奋（或者演戏）。
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-800/50">
          <div className="flex justify-between items-center text-xs font-bold text-orange-800 dark:text-orange-300">
            <span>当前称号：</span>
            <span className="bg-orange-600 text-white px-2 py-0.5 rounded">
              {state.lazyTitle}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">任务类型分布</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 text-xs font-medium text-slate-500 dark:text-slate-400">工作</div>
            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${(workTasks / totalCategorized) * 100}%` }}></div>
            </div>
            <div className="w-8 text-xs text-right font-bold text-slate-900 dark:text-white">{Math.round((workTasks / totalCategorized) * 100)}%</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 text-xs font-medium text-slate-500 dark:text-slate-400">生活</div>
            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(lifeTasks / totalCategorized) * 100}%` }}></div>
            </div>
            <div className="w-8 text-xs text-right font-bold text-slate-900 dark:text-white">{Math.round((lifeTasks / totalCategorized) * 100)}%</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 text-xs font-medium text-slate-500 dark:text-slate-400">学习</div>
            <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(studyTasks / totalCategorized) * 100}%` }}></div>
            </div>
            <div className="w-8 text-xs text-right font-bold text-slate-900 dark:text-white">{Math.round((studyTasks / totalCategorized) * 100)}%</div>
          </div>
        </div>
      </div>

      <div className="m-4 p-5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-lg">
            <Timer className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
              番茄钟使用统计
            </h3>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-300/60">
              你总共专注了 {totalTomatoes} 次，共计 {totalFocusTime} 分钟。
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
