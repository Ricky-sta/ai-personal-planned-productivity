import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { generateSchedule, timeToMinutes, minutesToTime } from '../engine/scheduler.ts';
import { ScheduledSlot, ScheduleResult } from '../types/index.ts';
import { fireCelebrationConfetti } from '../utils/confetti.ts';

export const TimetableGeneratorView: React.FC = () => {
  const {
    profile,
    tasks,
    events,
    timetableSlots,
    commitTimetable,
    toggleSlotLockState,
    setNotificationMessage,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [workStart, setWorkStart] = useState<string>(profile?.workHoursStart || '07:30');
  const [workEnd, setWorkEnd] = useState<string>(profile?.workHoursEnd || '22:30');
  const [breakDuration, setBreakDuration] = useState<number>(profile?.defaultBreakDuration || 10);
  const [respectCurrentTime, setRespectCurrentTime] = useState<boolean>(true);

  const [generatedResult, setGeneratedResult] = useState<ScheduleResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Existing slots for selected date
  const existingForDate = timetableSlots.filter(s => s.date === selectedDate);

  const handleGenerate = () => {
    setIsGenerating(true);
    setSavedSuccess(false);

    let currentTimeParam: string | undefined = undefined;
    if (respectCurrentTime && selectedDate === todayStr) {
      const now = new Date();
      currentTimeParam = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }

    const result = generateSchedule({
      date: selectedDate,
      currentTime: currentTimeParam,
      workingHours: { start: workStart, end: workEnd },
      breakDuration,
      fixedEvents: events,
      existingSlots: timetableSlots,
      tasks,
    });

    setGeneratedResult(result);
    setIsGenerating(false);

    if (result.isValid) {
      fireCelebrationConfetti();
      setNotificationMessage('✨ Conflict-free schedule generated successfully!');
    }
  };

  const handleApplyTimetable = async () => {
    if (!generatedResult) return;
    await commitTimetable(generatedResult.scheduledSlots, selectedDate);
    setSavedSuccess(true);
    setNotificationMessage('Timetable committed to your personal schedule! 🌸');
  };

  const displaySlots = generatedResult ? generatedResult.scheduledSlots : existingForDate;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-indigo-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            Intelligent Timetable Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic, conflict-free daily scheduling respecting fixed university classes, travel, and task urgencies.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-extrabold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200 transition"
        >
          <Sparkles className="w-4 h-4 text-yellow-200" />
          {isGenerating ? 'Computing Slots...' : 'Generate My Schedule ✨'}
        </button>
      </div>

      {/* Scheduler Configuration Controls */}
      <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-pink-100 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Scheduling Parameters & Windows
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setGeneratedResult(null);
                setSavedSuccess(false);
              }}
              className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Work Window</label>
            <div className="flex items-center gap-1.5">
              <input
                type="time"
                value={workStart}
                onChange={e => setWorkStart(e.target.value)}
                className="w-full px-2 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="time"
                value={workEnd}
                onChange={e => setWorkEnd(e.target.value)}
                className="w-full px-2 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Break Duration (mins)</label>
            <input
              type="number"
              min="5"
              max="60"
              step="5"
              value={breakDuration}
              onChange={e => setBreakDuration(Number(e.target.value))}
              className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="inline-flex items-center gap-2 cursor-pointer pb-2 text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={respectCurrentTime}
                onChange={e => setRespectCurrentTime(e.target.checked)}
                className="rounded text-pink-500 w-4 h-4"
              />
              Never schedule in the past
            </label>
          </div>
        </div>

        {/* Informative constraints summary */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-pink-50">
          <span className="flex items-center gap-1 font-semibold text-rose-600">
            <ShieldCheck className="w-3.5 h-3.5" /> Fixed College Hours Guaranteed
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-amber-600">
            <ShieldCheck className="w-3.5 h-3.5" /> Travel Windows Protected
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-purple-600">
            <ShieldCheck className="w-3.5 h-3.5" /> Locked Pinned Slots Kept Intact
          </span>
        </div>
      </div>

      {/* Validation / Conflict Alerts */}
      {generatedResult && !generatedResult.isValid && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Scheduling Conflict Detected!
          </div>
          {generatedResult.conflicts.map((c, i) => (
            <p key={i} className="pl-6">• {c}</p>
          ))}
        </div>
      )}

      {/* Main Timetable Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Generated Slots */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Timetable for {selectedDate}
                </h3>
                <p className="text-xs text-slate-500">
                  {displaySlots.length} scheduled intervals
                  {generatedResult && ` • ${generatedResult.totalFocusMinutes} focus minutes`}
                </p>
              </div>

              {generatedResult && (
                <button
                  onClick={handleApplyTimetable}
                  disabled={savedSuccess}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                    savedSuccess
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white hover:opacity-90'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {savedSuccess ? 'Saved to Calendar!' : 'Apply & Save Timetable'}
                </button>
              )}
            </div>

            {displaySlots.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No timetable slots for this date</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Click "Generate My Schedule ✨" above to compute optimal slots.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {displaySlots.map(slot => (
                  <div
                    key={slot.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      slot.isFixed
                        ? 'bg-rose-50/50 border-rose-200'
                        : slot.isLocked
                        ? 'bg-purple-50/50 border-purple-200'
                        : 'bg-white border-pink-100/70 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-20">
                        <span className="text-xs font-extrabold text-slate-700 block">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {slot.endMinutes - slot.startMinutes}m
                        </span>
                      </div>

                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{slot.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              slot.category === 'College'
                                ? 'bg-rose-100 text-rose-700'
                                : slot.category === 'Travel'
                                ? 'bg-amber-100 text-amber-700'
                                : slot.category === 'Exam'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-pink-100 text-pink-700'
                            }`}
                          >
                            {slot.category}
                          </span>
                          {slot.isFixed && <span className="text-rose-600 font-semibold">• Fixed Event</span>}
                          {slot.isLocked && !slot.isFixed && <span className="text-purple-600 font-semibold">• Pinned Slot</span>}
                        </div>
                      </div>
                    </div>

                    {/* Lock / Unlock Toggle Button */}
                    {!slot.isFixed && (
                      <button
                        onClick={() => toggleSlotLockState(slot.id, !slot.isLocked)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                          slot.isLocked
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={slot.isLocked ? 'Pinned: Protected from schedule regeneration' : 'Pin to lock slot position'}
                      >
                        {slot.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{slot.isLocked ? 'Pinned' : 'Pin'}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Unplaced Tasks & Explanations */}
        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border border-pink-100 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-800 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Scheduling Diagnostics
            </h3>

            {generatedResult ? (
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs">
                  <div className="flex justify-between font-bold text-indigo-900 mb-1">
                    <span>Focus Planned:</span>
                    <span>{generatedResult.totalFocusMinutes} mins</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Available Free Time:</span>
                    <span>{generatedResult.totalFreeMinutes} mins</span>
                  </div>
                </div>

                {generatedResult.unplacedTasks.length === 0 ? (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Every pending task fits into today's schedule! Excellent! ✨</span>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">
                      Tasks Not Scheduled ({generatedResult.unplacedTasks.length})
                    </h4>
                    <div className="space-y-2">
                      {generatedResult.unplacedTasks.map((u, i) => (
                        <div key={i} className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 text-xs">
                          <p className="font-bold text-amber-900">{u.task.title}</p>
                          <p className="text-[11px] text-amber-700 mt-1 leading-snug">
                            Reason: {u.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">
                Run schedule generation to view interval diagnostics and unplaced task explanations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
