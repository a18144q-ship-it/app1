import { useEffect } from 'react';
import { NavLink, useLocation, useOutlet } from 'react-router-dom';
import { Home, CheckSquare, Sparkles, Timer, BarChart2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';
import { useAppStore } from '../store';

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const [state, setState] = useAppStore();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;
    const newTasks = (state.tasks || []).map(task => {
      if (task.date && task.date < today && task.status !== 'completed' && task.status !== 'waste') {
        hasChanges = true;
        return { ...task, status: 'waste' as const, title: '你真是废物', description: '未按时完成' };
      }
      return task;
    });

    if (hasChanges) {
      setState({ tasks: newTasks });
    }
  }, [state.tasks, setState]);

  const navItems = [
    { to: "/", icon: Home, label: "首页" },
    { to: "/tasks", icon: CheckSquare, label: "任务" },
    { to: "/ai", icon: Sparkles, label: "AI" },
    { to: "/focus", icon: Timer, label: "专注" },
    { to: "/stats", icon: BarChart2, label: "统计" },
    { to: "/sync", icon: RefreshCw, label: "同步" },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col md:flex-row bg-slate-50 dark:bg-black overflow-x-hidden transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-50">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[#4cb2e6]">自种自收</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-[#4cb2e6]/10 text-[#4cb2e6] font-semibold" 
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-5xl mx-auto w-full h-full px-4 py-6 md:px-8 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 pb-safe-2 pt-2 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 transition-colors",
                isActive ? "text-[#4cb2e6]" : "text-slate-400 hover:text-[#4cb2e6]"
              )
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
