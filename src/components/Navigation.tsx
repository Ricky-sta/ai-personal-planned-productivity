import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  GraduationCap,
  Flame,
  Timer,
  BarChart3,
  Bot,
  Database,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface NavigationProps {
  onOpenAiChat: () => void;
  onOpenDataModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenAiChat, onOpenDataModal }) => {
  const {
    activeTab,
    setActiveTab,
    user,
    profile,
    logout,
    reducedMotion,
    setReducedMotion,
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'tasks', label: 'Tasks & Deadlines', icon: CheckSquare, badge: null },
    { id: 'timetable', label: 'Timetable AI', icon: Clock, badge: 'Smart' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: null },
    { id: 'academic', label: 'Academic & SGPA', icon: GraduationCap, badge: `${profile?.targetSGPA || '9.0'}` },
    { id: 'routines', label: 'Routines & Habits', icon: Flame, badge: null },
    { id: 'focus', label: 'Focus Mode', icon: Timer, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-md border-r border-pink-100/80 p-4 fixed top-0 bottom-0 z-30 shadow-sm shadow-pink-50">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-pink-100/60">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-indigo-300 flex items-center justify-center text-white shadow-md shadow-pink-200">
            <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent font-['Quicksand']">
              ASTRA-PLAN
            </h1>
            <p className="text-[10px] text-pink-400 font-semibold tracking-wider uppercase">
              Personal Time-Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-200 translate-x-1'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white/25 text-white' : 'bg-pink-100 text-pink-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Companion Chat Shortcut */}
        <div className="my-3 p-3 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border border-pink-100 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-pink-700 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-pink-500" />
              {profile?.mascotName || 'Astra-chan'}
            </span>
            <span className="text-[9px] bg-pink-200/60 text-pink-800 px-1.5 py-0.5 rounded-md font-semibold">
              AI Companion
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2 leading-tight">
            Need motivation, schedule re-alignment, or exam prep tips?
          </p>
          <button
            onClick={onOpenAiChat}
            className="w-full py-1.5 px-3 bg-white hover:bg-pink-100/60 border border-pink-200 text-pink-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            Talk to Companion
          </button>
        </div>

        {/* PWA Home Screen Install Button */}
        <div className="mb-2">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Bottom User & Settings Bar */}
        <div className="pt-3 border-t border-pink-100/60 space-y-2">
          {/* Motion & Data buttons */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className="flex items-center gap-1.5 hover:text-pink-600 transition"
              title="Toggle reduced motion for accessibility"
            >
              {reducedMotion ? <Moon className="w-3.5 h-3.5 text-purple-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span className="text-[11px]">{reducedMotion ? 'Calm Mode' : 'Motion On'}</span>
            </button>
            <button
              onClick={onOpenDataModal}
              className="flex items-center gap-1 hover:text-pink-600 transition"
              title="Backup, export, or manage data"
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">Data</span>
            </button>
          </div>

          {/* Account Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/50 border border-pink-100/50">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 text-xs font-bold uppercase shrink-0">
                {profile?.displayName?.slice(0, 1) || user?.displayName?.slice(0, 1) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{profile?.displayName || user?.displayName || 'Planner'}</p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 inline" />
                  {user?.email || 'Logged in'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top App Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-pink-100 px-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-400 to-indigo-300 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-['Quicksand']">
              ASTRA-PLAN
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton variant="compact" />
          <button
            onClick={onOpenAiChat}
            className="p-1.5 text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-xs font-bold flex items-center gap-1"
          >
            <Bot className="w-4 h-4" />
            <span className="text-[11px]">Astra</span>
          </button>
          <button
            onClick={onOpenDataModal}
            className="p-2 text-slate-500 hover:text-pink-600"
            title="Data settings"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-pink-100 flex items-center justify-around px-2 z-30 shadow-lg shadow-pink-100/50">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'timetable', label: 'Schedule', icon: Clock },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'academic', label: 'SGPA', icon: GraduationCap },
          { id: 'focus', label: 'Focus', icon: Timer },
          { id: 'analytics', label: 'Stats', icon: BarChart3 },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition ${
                isActive ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-pink-500 scale-110' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
