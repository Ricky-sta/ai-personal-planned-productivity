import React, { useState } from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Dumbbell,
  Code,
  BookOpen,
  Sparkles,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Routine } from '../types/index.ts';

export const RoutinesView: React.FC = () => {
  const { routines, upsertRoutine, removeRoutine, toggleRoutineToday, profile } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formFreq, setFormFreq] = useState<'daily' | 'weekdays' | 'weekends' | 'weekly'>('daily');
  const [formTime, setFormTime] = useState('06:30');
  const [formDuration, setFormDuration] = useState<number>(30);

  const handleOpenAdd = () => {
    setEditingRoutine(null);
    setFormTitle('');
    setFormFreq('daily');
    setFormTime('06:30');
    setFormDuration(30);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (routine: Routine) => {
    setEditingRoutine(routine);
    setFormTitle(routine.title);
    setFormFreq(routine.frequency);
    setFormTime(routine.preferredTime || '06:30');
    setFormDuration(routine.durationMinutes);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const routineToSave: Routine = {
      id: editingRoutine ? editingRoutine.id : `routine-${Date.now()}`,
      userId: profile?.uid || 'user',
      title: formTitle.trim(),
      frequency: formFreq,
      preferredTime: formTime,
      durationMinutes: Number(formDuration),
      streak: editingRoutine ? editingRoutine.streak : 0,
      bestStreak: editingRoutine ? editingRoutine.bestStreak : 0,
      lastCompletedDate: editingRoutine ? editingRoutine.lastCompletedDate : undefined,
      updatedAt: new Date().toISOString(),
    };

    await upsertRoutine(routineToSave);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-amber-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-500" />
            Personal Routines & Habit Streaks
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build unshakeable discipline with daily coding, workout sessions, reading, and healthy sleep rhythms.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-200 transition"
        >
          <Plus className="w-4 h-4" />
          Create Routine
        </button>
      </div>

      {/* Routine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routines.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white/80 rounded-3xl border border-amber-100 shadow-xs">
            <Flame className="w-10 h-10 text-amber-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No routines created yet.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Create your daily gym, programming, or meditation routine!
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold"
            >
              Add First Routine
            </button>
          </div>
        ) : (
          routines.map(routine => {
            const isDoneToday = routine.lastCompletedDate === todayStr;
            return (
              <div
                key={routine.id}
                className={`bg-white/90 backdrop-blur-sm p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 shadow-xs ${
                  isDoneToday ? 'border-amber-300 bg-amber-50/20' : 'border-amber-100/70 hover:border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">{routine.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {routine.frequency} • {routine.preferredTime || 'flexible'} ({routine.durationMinutes}m)
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(routine)}
                        className="p-1 text-slate-400 hover:text-amber-600"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeRoutine(routine.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Streak highlight */}
                  <div className="flex items-center gap-3 mt-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      🔥
                    </div>
                    <div>
                      <span className="text-sm font-extrabold text-amber-900 block">
                        {routine.streak} Day Streak!
                      </span>
                      <span className="text-[10px] text-amber-700 font-medium">
                        Personal Best: {routine.bestStreak} days
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Toggle Button */}
                <button
                  onClick={() => toggleRoutineToday(routine.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                    isDoneToday
                      ? 'bg-amber-500 text-white shadow-amber-200'
                      : 'bg-white hover:bg-amber-50 border border-amber-200 text-amber-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isDoneToday ? 'Completed Today! ✨' : 'Mark Completed Today'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Routine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-100 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand']">
                {editingRoutine ? 'Edit Routine' : 'Create Routine'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Routine Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Gym & Mobility"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-amber-50/20 border border-amber-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Frequency</label>
                <select
                  value={formFreq}
                  onChange={e => setFormFreq(e.target.value as any)}
                  className="w-full px-3 py-2 bg-amber-50/20 border border-amber-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays Only</option>
                  <option value="weekends">Weekends Only</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-amber-50/20 border border-amber-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={formDuration}
                    onChange={e => setFormDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-amber-50/20 border border-amber-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs"
                >
                  Save Routine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
