import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navigation } from './components/Navigation.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { TimetableGeneratorView } from './components/TimetableGeneratorView.tsx';
import { CalendarView } from './components/CalendarView.tsx';
import { AcademicView } from './components/AcademicView.tsx';
import { RoutinesView } from './components/RoutinesView.tsx';
import { FocusModeView } from './components/FocusModeView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { CompanionChatModal } from './components/CompanionChatModal.tsx';
import { DataManagementModal } from './components/DataManagementModal.tsx';
import { AuthScreen } from './components/AuthScreen.tsx';
import { AstraMascot } from './components/AstraMascot.tsx';
import { OfflineIndicator } from './components/OfflineIndicator.tsx';
import { Sparkles, X, Plus } from 'lucide-react';
import { Task, CalendarEvent, AcademicGoal } from './types/index.ts';

function MainShell() {
  const {
    user,
    authLoading,
    activeTab,
    notificationMessage,
    setNotificationMessage,
    upsertTask,
    upsertEvent,
    upsertAcademic,
    profile,
  } = useApp();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Quick Action Modal states for Dashboard quick triggers
  const [quickTaskModal, setQuickTaskModal] = useState(false);
  const [quickEventModal, setQuickEventModal] = useState<string | null>(null); // category or null
  const [quickAcademicModal, setQuickAcademicModal] = useState(false);

  // Quick Task form fields
  const [qTitle, setQTitle] = useState('');
  const [qCategory, setQCategory] = useState('University');
  const [qPriority, setQPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [qDuration, setQDuration] = useState(60);

  // Quick Event form fields
  const [eTitle, setETitle] = useState('');
  const [eStart, setEStart] = useState('09:00');
  const [eEnd, setEEnd] = useState('11:00');

  // Quick Academic form fields
  const [aSubject, setASubject] = useState('');
  const [aCredits, setACredits] = useState(4);
  const [aPlanned, setAPlanned] = useState(30);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-pink-50 via-purple-50 to-peach-50 text-center space-y-4">
        <AstraMascot mood="happy" size="lg" />
        <div className="flex items-center gap-2 text-pink-600 font-extrabold text-sm">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>Connecting to your private ASTRA-PLAN vault...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const handleSaveQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTitle.trim()) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      userId: user.uid,
      title: qTitle.trim(),
      category: qCategory,
      priority: qPriority,
      estimatedMinutes: Number(qDuration),
      deadlineDate: new Date().toISOString().split('T')[0],
      minSessionMinutes: 30,
      canSplit: true,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await upsertTask(newTask);
    setQTitle('');
    setQuickTaskModal(false);
    setNotificationMessage(`Task "${newTask.title}" added to your planner! ✨`);
  };

  const handleSaveQuickEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eTitle.trim()) return;
    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      userId: user.uid,
      title: eTitle.trim(),
      category: quickEventModal || 'College',
      date: new Date().toISOString().split('T')[0],
      startTime: eStart,
      endTime: eEnd,
      isFixed: true,
    };
    await upsertEvent(newEvent);
    setETitle('');
    setQuickEventModal(null);
    setNotificationMessage(`Event "${newEvent.title}" pinned to your calendar! 🌸`);
  };

  const handleSaveQuickAcademic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aSubject.trim()) return;
    const newGoal: AcademicGoal = {
      id: `acad-${Date.now()}`,
      userId: user.uid,
      subjectName: aSubject.trim(),
      credits: Number(aCredits),
      targetGrade: 'A+',
      plannedHours: Number(aPlanned),
      completedHours: 0,
      semester: 'Current Semester',
      updatedAt: new Date().toISOString(),
    };
    await upsertAcademic(newGoal);
    setASubject('');
    setQuickAcademicModal(false);
    setNotificationMessage(`Course "${newGoal.subjectName}" added to SGPA goals! 💫`);
  };

  return (
    <div className="min-h-screen bg-rose-50/20 text-slate-800 flex">
      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Navigation Component */}
      <Navigation
        onOpenAiChat={() => setIsChatOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 min-w-0 flex flex-col min-h-screen">
        {/* Toast Notification Banner */}
        {notificationMessage && (
          <div className="fixed top-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-pink-300 text-pink-900 px-4 py-2.5 rounded-2xl shadow-lg shadow-pink-100 flex items-center gap-3 text-xs font-bold animate-fade-in max-w-sm">
            <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
            <span className="flex-1">{notificationMessage}</span>
            <button
              onClick={() => setNotificationMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* View Router */}
        <div className="flex-1 p-4 md:p-8 pt-18 lg:pt-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenAddTask={() => setQuickTaskModal(true)}
              onOpenAddEvent={(category?: string) => setQuickEventModal(category || 'College')}
              onOpenAddAcademic={() => setQuickAcademicModal(true)}
              onOpenAiChat={() => setIsChatOpen(true)}
            />
          )}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'timetable' && <TimetableGeneratorView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'academic' && <AcademicView />}
          {activeTab === 'routines' && <RoutinesView />}
          {activeTab === 'focus' && <FocusModeView />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </div>
      </main>

      {/* AI Companion Modal */}
      <CompanionChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Data Management Modal */}
      <DataManagementModal isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} />

      {/* Quick Add Task Modal */}
      {quickTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-500" />
                Quick Add Task
              </h3>
              <button onClick={() => setQuickTaskModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveQuickTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems Lab Preparation"
                  value={qTitle}
                  onChange={e => setQTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={qCategory}
                    onChange={e => setQCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-semibold"
                  >
                    {['University', 'Assignments', 'Exams', 'Programming', 'Personal', 'Fitness'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={qPriority}
                    onChange={e => setQPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-semibold"
                  >
                    {['Critical', 'High', 'Medium', 'Low'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Est. Minutes</label>
                <input
                  type="number"
                  min="15"
                  max="360"
                  step="15"
                  value={qDuration}
                  onChange={e => setQDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setQuickTaskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Event Modal */}
      {quickEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-500" />
                Quick Add {quickEventModal} Event
              </h3>
              <button onClick={() => setQuickEventModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveQuickEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Lecture & Discussion"
                  value={eTitle}
                  onChange={e => setETitle(e.target.value)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={eStart}
                    onChange={e => setEStart(e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={eEnd}
                    onChange={e => setEEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setQuickEventModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl text-xs"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Academic Goal Modal */}
      {quickAcademicModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                Quick Add Course Goal
              </h3>
              <button onClick={() => setQuickAcademicModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveQuickAcademic} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems"
                  value={aSubject}
                  onChange={e => setASubject(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={aCredits}
                    onChange={e => setACredits(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Planned Hours</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={aPlanned}
                    onChange={e => setAPlanned(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-purple-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setQuickAcademicModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  Add Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainShell />
    </AppProvider>
  );
}
