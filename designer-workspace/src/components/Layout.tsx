import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Sparkles, Timer, BarChart2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { cn } from '../utils/cn';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col bg-slate-50 dark:bg-black overflow-x-hidden shadow-xl transition-colors duration-300">
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <div key={location.pathname} className="h-full">
            <Outlet />
          </div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 pb-safe-2 pt-2 flex justify-between items-center z-50">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#4cb2e6]" : "text-slate-400 hover:text-[#4cb2e6]"
            )
          }
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">首页</span>
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#4cb2e6]" : "text-slate-400 hover:text-[#4cb2e6]"
            )
          }
        >
          <CheckSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">任务</span>
        </NavLink>
        <NavLink
          to="/ai"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#4cb2e6]" : "text-slate-400 hover:text-[#4cb2e6]"
            )
          }
        >
          <Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-medium">AI</span>
        </NavLink>
        <NavLink
          to="/focus"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#4cb2e6]" : "text-slate-400 hover:text-[#4cb2e6]"
            )
          }
        >
          <Timer className="w-6 h-6" />
          <span className="text-[10px] font-medium">专注</span>
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#4cb2e6]" : "text-slate-400 hover:text-[#4cb2e6]"
            )
          }
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-medium">统计</span>
        </NavLink>
      </nav>
    </div>
  );
}
