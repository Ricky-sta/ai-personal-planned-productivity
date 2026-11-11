import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Coffee,
  Check,
  History,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AstraMascot } from './AstraMascot.tsx';
import { fireAchievementBurst } from '../utils/confetti.ts';

export const FocusModeView: React.FC = () => {
  const { tasks, logCompletedFocus, focusSessions, profile, reducedMotion } = useApp();

  const [focusDurationMins, setFocusDurationMins] = useState<number>(profile?.defaultFocusDuration || 45);
  const [breakDurationMins, setBreakDurationMins] = useState<number>(profile?.defaultBreakDuration || 10);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(focusDurationMins * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Sync initial duration
  useEffect(() => {
    if (!isActive) {
      setTimeLeft((mode === 'focus' ? focusDurationMins : breakDurationMins) * 60);
    }
  }, [focusDurationMins, breakDurationMins, mode, isActive]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleCompleteTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  const handleCompleteTimer = async () => {
    setIsActive(false);
    if (mode === 'focus') {
      fireAchievementBurst();
      await logCompletedFocus(
        focusDurationMins,
        selectedTaskId || undefined,
        selectedTask?.title || undefined,
        sessionNotes.trim() || undefined
      );
      setSessionNotes('');
      setMode('break');
      setTimeLeft(breakDurationMins * 60);
    } else {
      setMode('focus');
      setTimeLeft(focusDurationMins * 60);
    }
  };

  const toggleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft((mode === 'focus' ? focusDurationMins : breakDurationMins) * 60);
  };

  const handleManualComplete = async () => {
    if (mode === 'focus') {
      const elapsedMins = Math.max(1, Math.round((focusDurationMins * 60 - timeLeft) / 60));
      await logCompletedFocus(
        elapsedMins,
        selectedTaskId || undefined,
        selectedTask?.title || undefined,
        sessionNotes.trim() || undefined
      );
      handleReset();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSeconds = (mode === 'focus' ? focusDurationMins : breakDurationMins) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = focusSessions.filter(f => f.date === todayStr);
  const todayTotalFocusMinutes = todaySessions.reduce((sum, f) => sum + f.durationMinutes, 0);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <Timer className="w-6 h-6 text-pink-500" />
            Personal Focus & Pomodoro Chamber
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deep focus with gentle anime companion encouragement. Every session is logged toward your SGPA consistency.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-pink-50 p-2 rounded-2xl border border-pink-100 text-xs font-bold text-pink-800">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span>Logged Today: {todayTotalFocusMinutes} mins</span>
        </div>
      </div>

      {/* Main Focus Chamber Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-50/80 via-purple-50/60 to-indigo-50/70 p-8 rounded-3xl border border-pink-200/80 shadow-md shadow-pink-100 flex flex-col items-center text-center space-y-6">
        {/* Soft background aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector */}
        <div className="relative z-10 flex items-center gap-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-2xl border border-pink-100">
          <button
            onClick={() => {
              setMode('focus');
              setIsActive(false);
              setTimeLeft(focusDurationMins * 60);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xs'
                : 'text-slate-600 hover:text-pink-600'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            Focus Session
          </button>
          <button
            onClick={() => {
              setMode('break');
              setIsActive(false);
              setTimeLeft(breakDurationMins * 60);
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
              mode === 'break'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            Rest Break
          </button>
        </div>

        {/* Calming Anime Companion in Focus/Calm state */}
        <div className="relative z-10">
          <AstraMascot
            mood={isActive ? (mode === 'focus' ? 'calm' : 'happy') : 'encouraging'}
            size="lg"
            showDialogue={true}
            dialogue={
              isActive
                ? mode === 'focus'
                  ? 'In the deep flow state... Astra is watching over you peacefully 🌸'
                  : 'Time to hydrate and stretch! You worked so hard ✨'
                : 'Ready when you are, my star! Select your task and click Start!'
            }
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Big Circular / Radial Timer */}
        <div className="relative z-10 space-y-2">
          <div className="text-6xl md:text-7xl font-black tracking-tight text-slate-800 font-mono">
            {formatTime(timeLeft)}
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {mode === 'focus' ? 'Deep Work Interval' : 'Recharge Interval'}
          </p>

          {/* Progress bar */}
          <div className="w-64 md:w-80 h-2.5 bg-white/80 rounded-full mx-auto overflow-hidden border border-pink-100 mt-3">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                mode === 'focus' ? 'bg-pink-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls: Play, Pause, Reset, Complete */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={toggleStartPause}
            className={`px-6 py-3 rounded-2xl font-extrabold text-sm text-white shadow-lg transition flex items-center gap-2 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 shadow-pink-200'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isActive ? 'Pause' : 'Start Focus'}
          </button>

          <button
            onClick={handleReset}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl transition"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isActive && mode === 'focus' && (
            <button
              onClick={handleManualComplete}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-xs transition flex items-center gap-1.5 shadow-sm"
              title="Log current minutes as completed"
            >
              <Check className="w-4 h-4" />
              Complete Session
            </button>
          )}
        </div>

        {/* Task Linking Selector & Custom Duration */}
        <div className="relative z-10 w-full max-w-md bg-white/90 p-4 rounded-2xl border border-pink-100 space-y-3 text-left">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Link to Active Task (Optional)
            </label>
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">No linked task (General Study / Coding)</option>
              {tasks
                .filter(t => !t.isCompleted)
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.category} - {t.estimatedMinutes}m)
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Focus Duration (mins)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                disabled={isActive}
                value={focusDurationMins}
                onChange={e => setFocusDurationMins(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-pink-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Break Duration (mins)
              </label>
              <input
                type="number"
                min="2"
                max="30"
                step="1"
                disabled={isActive}
                value={breakDurationMins}
                onChange={e => setBreakDurationMins(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-pink-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Session Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Read pages 40-75, solved 3 LeetCode problems..."
              value={sessionNotes}
              onChange={e => setSessionNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-pink-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>

      {/* Focus History Log */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs space-y-3">
        <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
          <History className="w-4 h-4 text-purple-500" />
          Recent Focus Sessions Log
        </h3>

        {focusSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No completed focus sessions logged yet. Complete your first session to track real productivity!
          </p>
        ) : (
          <div className="space-y-2">
            {focusSessions.slice(0, 5).map(session => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-pink-50/30 rounded-2xl border border-pink-100/60 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800">
                    {session.taskTitle || 'General Focus Session'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {session.date} • {session.durationMinutes} minutes logged
                    {session.notes ? ` • "${session.notes}"` : ''}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-pink-100 text-pink-700 font-extrabold rounded-lg text-[10px]">
                  +{session.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
