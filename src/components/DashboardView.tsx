import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  PlusCircle,
  GraduationCap,
  Flame,
  Timer,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AstraMascot, MascotMood } from './AstraMascot.tsx';
import { timeToMinutes } from '../engine/scheduler.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface DashboardViewProps {
  onOpenAddTask: () => void;
  onOpenAddEvent: (category?: string) => void;
  onOpenAddAcademic: () => void;
  onOpenAiChat: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTask,
  onOpenAddEvent,
  onOpenAddAcademic,
  onOpenAiChat,
}) => {
  const {
    profile,
    tasks,
    events,
    routines,
    focusSessions,
    timetableSlots,
    toggleTaskCompletion,
    toggleRoutineToday,
    setActiveTab,
    reducedMotion,
  } = useApp();

  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(
        now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayDate = new Date().toISOString().split('T')[0];

  // Tasks statistics
  const todayTasks = tasks.filter(t => t.deadlineDate === todayDate || !t.deadlineDate);
  const completedToday = tasks.filter(t => t.isCompleted && t.completedAt?.startsWith(todayDate));
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Focus minutes today
  const todayFocusMinutes = focusSessions
    .filter(f => f.date === todayDate)
    .reduce((sum, f) => sum + f.durationMinutes, 0);

  // Completed routines today
  const completedRoutinesToday = routines.filter(r => r.lastCompletedDate === todayDate);

  // Upcoming deadlines
  const upcomingDeadlines = [...pendingTasks]
    .filter(t => Boolean(t.deadlineDate))
    .sort((a, b) => (a.deadlineDate || '').localeCompare(b.deadlineDate || ''))
    .slice(0, 3);

  // Today's timetable slots
  const todaySlots = timetableSlots
    .filter(s => s.date === todayDate)
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Next scheduled activity
  const nowMin = timeToMinutes(currentTimeStr || '00:00');
  const nextActivity = todaySlots.find(s => s.startMinutes >= nowMin);

  // Companion mood and speech bubble dialogue
  const getCompanionDialogue = (): { mood: MascotMood; dialogue: string } => {
    if (completedToday.length > 0 && pendingTasks.length === 0) {
      return {
        mood: 'celebratory',
        dialogue: "You cleared all tasks for today, Senpai! You're truly shining like a star! ✨🎉",
      };
    }
    if (pendingTasks.filter(t => t.priority === 'Critical').length > 0) {
      return {
        mood: 'encouraging',
        dialogue: "We have an urgent deadline today! Let's take a deep breath and conquer it together! 🌸",
      };
    }
    if (todayFocusMinutes >= 90) {
      return {
        mood: 'happy',
        dialogue: `${todayFocusMinutes} minutes of deep focus already logged! Your academic SGPA target is within reach! 💫`,
      };
    }
    return {
      mood: 'happy',
      dialogue: "Welcome back, my star! Let's make today beautiful and productive ✨",
    };
  };

  const companion = getCompanionDialogue();

  return (
    <div className="space-y-6 pb-12">
      {/* PWA Home Screen Installation Banner */}
      <PWAInstallButton variant="banner" />

      {/* Anime Header Greeting & Companion Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-100/90 via-purple-100/80 to-peach-100/70 p-6 md:p-8 border border-pink-200/70 shadow-sm shadow-pink-100">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-pink-300/30 via-purple-300/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full border border-pink-200/60 text-xs font-semibold text-pink-700">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>{currentDateStr} • {currentTimeStr}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight font-['Quicksand']">
              Welcome back, <span className="bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">{profile?.displayName || 'my star'}</span>! ✨
            </h2>
            <p className="text-sm text-slate-600 max-w-lg">
              Let's make today beautiful. You have{' '}
              <strong className="text-pink-600">{pendingTasks.length} pending tasks</strong> and{' '}
              <strong className="text-purple-600">{todayFocusMinutes} focus minutes</strong> logged today.
            </p>
          </div>

          {/* Interactive Anime Companion Mascot */}
          <div className="shrink-0 flex items-center">
            <AstraMascot
              mood={companion.mood}
              size="lg"
              showDialogue={true}
              dialogue={companion.dialogue}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-pink-100 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddTask}
            className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs shadow-pink-200"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Task
          </button>
          <button
            onClick={() => onOpenAddEvent('College')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-500" />
            Add College Event
          </button>
          <button
            onClick={() => onOpenAddAcademic()}
            className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
            Add Exam / Goal
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Generate Timetable
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Timer className="w-3.5 h-3.5 text-amber-500" />
            Start Focus Session
          </button>
        </div>
      </div>

      {/* Grid: Overview Cards & Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Completion Card */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-pink-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Tasks Completed</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-800">{completedCount}</span>
              <span className="text-xs text-slate-400">/ {totalTasksCount} total</span>
            </div>
            <div className="w-28 bg-pink-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Focus Minutes Card */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Focus Logged</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-purple-700">{todayFocusMinutes}</span>
              <span className="text-xs text-slate-400">mins today</span>
            </div>
            <p className="text-[11px] text-purple-500 font-semibold mt-2">
              {todayFocusMinutes >= 45 ? '✨ Target reached' : `${45 - todayFocusMinutes}m to 45m goal`}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
            <Timer className="w-6 h-6" />
          </div>
        </div>

        {/* Routines Streak Card */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Daily Routines</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-700">{completedRoutinesToday.length}</span>
              <span className="text-xs text-slate-400">/ {routines.length} completed</span>
            </div>
            <p className="text-[11px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 inline" />
              {routines.reduce((max, r) => Math.max(max, r.streak), 0)} days top streak
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Academic SGPA Card */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Academic SGPA</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-indigo-700">{profile?.currentSGPA || 8.75}</span>
              <span className="text-xs text-slate-400">/ Target {profile?.targetSGPA || 9.0}</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 inline text-indigo-500" />
              {((profile?.targetSGPA || 9.0) - (profile?.currentSGPA || 8.75)).toFixed(2)} to 9.0+ milestone
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today Priorities & Timetable */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Top Priorities */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-pink-100/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                Today's Top Priorities
              </h3>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
              >
                View all tasks <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 px-4 bg-pink-50/40 rounded-2xl border border-dashed border-pink-200">
                <CheckCircle2 className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">All tasks completed for today!</p>
                <p className="text-xs text-slate-500 mt-1">Take a soothing break or add new goals for tomorrow.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/30 hover:bg-pink-50/70 border border-pink-100/60 transition group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="w-5 h-5 rounded-lg border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-100 flex items-center justify-center transition shrink-0"
                        title="Mark complete"
                      >
                        {task.isCompleted && <CheckCircle2 className="w-4 h-4 text-pink-600" />}
                      </button>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{task.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-white border border-pink-100 font-semibold text-pink-700">
                            {task.category}
                          </span>
                          <span>•</span>
                          <span>{task.estimatedMinutes} mins</span>
                          {task.deadlineTime && (
                            <>
                              <span>•</span>
                              <span className="text-rose-500 font-medium">Due {task.deadlineTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        task.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Visual Timetable Timeline */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-pink-100/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Today's Schedule & Timeline
                </h3>
                {nextActivity && (
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    Next up: {nextActivity.title} ({nextActivity.startTime} - {nextActivity.endTime})
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Open Scheduler <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaySlots.length === 0 ? (
              <div className="text-center py-8 px-4 bg-indigo-50/30 rounded-2xl border border-dashed border-indigo-200">
                <Clock className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No schedule generated for today yet.</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">
                  Astra's deterministic scheduler can auto-balance your college hours, travel, and pending tasks!
                </p>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Generate My Schedule Now ✨
                </button>
              </div>
            ) : (
              <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-pink-300 before:via-indigo-300 before:to-purple-200">
                {todaySlots.map(slot => {
                  const isCurrent = slot.startMinutes <= nowMin && slot.endMinutes > nowMin;
                  return (
                    <div
                      key={slot.id}
                      className={`relative flex items-center justify-between p-3 rounded-2xl border transition ${
                        isCurrent
                          ? 'bg-pink-100/70 border-pink-300 shadow-sm'
                          : 'bg-white/80 border-slate-100 hover:border-pink-200'
                      }`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 border-white ${
                          isCurrent ? 'bg-pink-500 ring-4 ring-pink-100' : 'bg-slate-300'
                        }`}
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-slate-600 min-w-20">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{slot.title}</p>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">
                            {slot.category} {slot.isFixed ? '• Fixed' : ''}
                          </span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500 text-white font-bold animate-pulse">
                          Active Now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines, Routines & Companion Talk */}
        <div className="space-y-6">
          {/* Upcoming Academic Deadlines */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-rose-100/80 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Upcoming Deadlines
            </h3>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming deadlines logged.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map(t => (
                  <div key={t.id} className="p-3 bg-rose-50/40 rounded-2xl border border-rose-100/70">
                    <p className="text-xs font-bold text-slate-800 truncate">{t.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-rose-700 font-semibold mt-1">
                      <span>{t.category}</span>
                      <span>{t.deadlineDate} {t.deadlineTime || ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Habits & Routines */}
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-amber-100/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Daily Habits & Routines
              </h3>
              <button
                onClick={() => setActiveTab('routines')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                Manage
              </button>
            </div>

            {routines.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No routines set up yet.</p>
            ) : (
              <div className="space-y-2">
                {routines.slice(0, 4).map(routine => {
                  const isDone = routine.lastCompletedDate === todayDate;
                  return (
                    <div
                      key={routine.id}
                      onClick={() => toggleRoutineToday(routine.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition select-none ${
                        isDone
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-white/70 border-slate-100 hover:border-amber-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                            isDone ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-bold truncate ${isDone ? 'line-through text-slate-400' : ''}`}>
                          {routine.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                        🔥 {routine.streak}d
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Anime Mascot Daily Prompt Card */}
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white p-5 rounded-3xl shadow-md shadow-pink-200 text-center space-y-3">
            <h4 className="font-extrabold text-sm tracking-wide">Need Instant Guidance?</h4>
            <p className="text-xs text-pink-100 leading-relaxed">
              Astra can break down complex university assignments, reorganize an overloaded day, or boost your morale!
            </p>
            <button
              onClick={onOpenAiChat}
              className="w-full py-2 bg-white text-pink-600 hover:bg-pink-50 font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              Chat with Astra ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
