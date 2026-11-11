import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Download,
  Trash2,
  Edit2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { CalendarEvent } from '../types/index.ts';
import { exportEventsToICS } from '../services/dataService.ts';
import { hasOverlap, timeToMinutes } from '../engine/scheduler.ts';

const EVENT_CATEGORIES = [
  'College',
  'Travel',
  'Exam',
  'Appointment',
  'Routine',
  'Personal',
  'Study',
];

export const CalendarView: React.FC = () => {
  const { events, upsertEvent, removeEvent, profile, setNotificationMessage } = useApp();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('College');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formIsFixed, setFormIsFixed] = useState(true);
  const [formDesc, setFormDesc] = useState('');
  const [formConflictWarning, setFormConflictWarning] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setFormTitle('');
    setFormCategory('College');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStartTime('09:00');
    setFormEndTime('11:00');
    setFormIsFixed(true);
    setFormDesc('');
    setFormConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title);
    setFormCategory(ev.category);
    setFormDate(ev.date);
    setFormStartTime(ev.startTime);
    setFormEndTime(ev.endTime);
    setFormIsFixed(ev.isFixed);
    setFormDesc(ev.description || '');
    setFormConflictWarning(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const startMin = timeToMinutes(formStartTime);
    const endMin = timeToMinutes(formEndTime);

    if (startMin >= endMin) {
      alert('End time must be after start time!');
      return;
    }

    // Check conflict with other events on the same date
    const sameDateEvents = events.filter(
      ev => ev.date === formDate && (!editingEvent || ev.id !== editingEvent.id)
    );

    const conflicting = sameDateEvents.find(ev => {
      const eStart = timeToMinutes(ev.startTime);
      const eEnd = timeToMinutes(ev.endTime);
      return hasOverlap({ start: startMin, end: endMin }, { start: eStart, end: eEnd });
    });

    if (conflicting) {
      const msg = `Conflict: overlaps with "${conflicting.title}" (${conflicting.startTime}-${conflicting.endTime}).`;
      setFormConflictWarning(msg);
      // If it's a fixed event conflict, require user confirmation
      if (formIsFixed && conflicting.isFixed) {
        const proceed = confirm(
          `${msg}\nBoth events are marked as fixed commitments. Do you still want to proceed?`
        );
        if (!proceed) return;
      }
    }

    const eventToSave: CalendarEvent = {
      id: editingEvent ? editingEvent.id : `event-${Date.now()}`,
      userId: profile?.uid || 'user',
      title: formTitle.trim(),
      category: formCategory,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      isFixed: formIsFixed,
      description: formDesc.trim() || undefined,
    };

    await upsertEvent(eventToSave);
    setIsModalOpen(false);
  };

  const handleExportICS = () => {
    const icsData = exportEventsToICS(events);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra-plan-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    setNotificationMessage('Calendar exported to .ics format!');
  };

  // Date Navigation
  const prevDate = () => {
    const n = new Date(currentDate);
    if (viewMode === 'day') n.setDate(n.getDate() - 1);
    else if (viewMode === 'week') n.setDate(n.getDate() - 7);
    else n.setMonth(n.getMonth() - 1);
    setCurrentDate(n);
  };

  const nextDate = () => {
    const n = new Date(currentDate);
    if (viewMode === 'day') n.setDate(n.getDate() + 1);
    else if (viewMode === 'week') n.setDate(n.getDate() + 7);
    else n.setMonth(n.getMonth() + 1);
    setCurrentDate(n);
  };

  // Format header
  const getHeaderDateTitle = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (viewMode === 'week') {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString([], { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  // Week days calculation
  const getWeekDays = () => {
    const days: Date[] = [];
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - currentDate.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-pink-500" />
            Personal Calendar & Commitments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fixed university schedules, examinations, travel, appointments, and study blocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportICS}
            className="px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 border border-pink-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export .ICS
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-pink-200 transition"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* View Switcher & Navigation */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-pink-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={prevDate}
            className="p-1.5 text-slate-500 hover:bg-pink-50 rounded-xl transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-slate-800 px-2 min-w-48 text-center">
            {getHeaderDateTitle()}
          </span>
          <button
            onClick={nextDate}
            className="p-1.5 text-slate-500 hover:bg-pink-50 rounded-xl transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-[11px] font-bold px-2.5 py-1 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition ml-2"
          >
            Today
          </button>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1 bg-pink-50/50 p-1 rounded-xl border border-pink-100 text-xs font-bold">
          {(['day', 'week', 'month'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg capitalize transition ${
                viewMode === mode
                  ? 'bg-white text-pink-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Week View Grid */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((d, index) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayEvents = events
              .filter(e => e.date === dateStr)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

            return (
              <div
                key={index}
                className={`bg-white/90 backdrop-blur-sm rounded-3xl p-3 border min-h-64 flex flex-col justify-between shadow-xs ${
                  isToday ? 'border-pink-400 ring-2 ring-pink-100' : 'border-pink-100/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-50">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {d.toLocaleDateString([], { weekday: 'short' })}
                      </p>
                      <p className={`text-base font-extrabold ${isToday ? 'text-pink-600' : 'text-slate-700'}`}>
                        {d.getDate()}
                      </p>
                    </div>
                    {isToday && (
                      <span className="text-[9px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Event List */}
                  <div className="space-y-1.5">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        onClick={() => handleOpenEdit(ev)}
                        className={`p-2 rounded-xl text-left border cursor-pointer hover:shadow-xs transition ${
                          ev.category === 'College'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                            : ev.category === 'Travel'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : ev.category === 'Exam'
                            ? 'bg-red-50/70 border-red-200 text-red-900'
                            : 'bg-purple-50/70 border-purple-200 text-purple-900'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate leading-tight">{ev.title}</p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1">
                          <span>{ev.startTime}-{ev.endTime}</span>
                          {ev.isFixed && <span className="font-semibold text-rose-600">Fixed</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingEvent(null);
                    setFormTitle('');
                    setFormDate(dateStr);
                    setFormStartTime('09:00');
                    setFormEndTime('10:00');
                    setIsModalOpen(true);
                  }}
                  className="w-full mt-3 py-1 text-[10px] font-bold text-pink-500 hover:bg-pink-50 rounded-lg transition"
                >
                  + Add Event
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Day / Month Views fallback list */}
      {(viewMode === 'day' || viewMode === 'month') && (
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Events List</h3>
          {events
            .filter(e => (viewMode === 'day' ? e.date === currentDate.toISOString().split('T')[0] : true))
            .map(ev => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-3.5 bg-pink-50/30 rounded-2xl border border-pink-100/60"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{ev.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {ev.date} • {ev.startTime} to {ev.endTime} • {ev.category} {ev.isFixed ? '(Fixed)' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(ev)}
                    className="p-1.5 text-slate-400 hover:text-pink-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeEvent(ev.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal for adding/editing event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand']">
                {editingEvent ? 'Edit Commitment' : 'Add Calendar Commitment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            {formConflictWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{formConflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Lab, Bus Transit..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    {EVENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={e => setFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={e => setFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsFixed}
                    onChange={e => setFormIsFixed(e.target.checked)}
                    className="rounded text-pink-500 w-4 h-4"
                  />
                  Fixed Commitment (Scheduler cannot move this)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Classroom number, lecture topic, transit line..."
                  className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
