import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  Layers,
  CheckSquare,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { Task, TaskPriority, TaskCategory, TimeOfDay, TaskChecklistItem } from '../types/index.ts';

const CATEGORIES: TaskCategory[] = [
  'University',
  'Assignments',
  'Exams',
  'Programming',
  'Personal',
  'Fitness',
  'Music',
  'Creative',
  'Travel',
  'Other',
];

const PRIORITIES: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low'];

export const TasksView: React.FC = () => {
  const { tasks, upsertTask, removeTask, toggleTaskCompletion, profile } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'estimated'>('deadline');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [aiBreakdownMessage, setAiBreakdownMessage] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<string>('University');
  const [formPriority, setFormPriority] = useState<TaskPriority>('Medium');
  const [formEstimated, setFormEstimated] = useState<number>(60);
  const [formDeadlineDate, setFormDeadlineDate] = useState('');
  const [formDeadlineTime, setFormDeadlineTime] = useState('');
  const [formPrefTime, setFormPrefTime] = useState<TimeOfDay>('any');
  const [formMinSession, setFormMinSession] = useState<number>(30);
  const [formCanSplit, setFormCanSplit] = useState(true);
  const [formNotes, setFormNotes] = useState('');
  const [formChecklist, setFormChecklist] = useState<TaskChecklistItem[]>([]);
  const [newCheckItemText, setNewCheckItemText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('University');
    setFormPriority('Medium');
    setFormEstimated(60);
    setFormDeadlineDate(todayStr);
    setFormDeadlineTime('20:00');
    setFormPrefTime('any');
    setFormMinSession(30);
    setFormCanSplit(true);
    setFormNotes('');
    setFormChecklist([]);
    setAiBreakdownMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormEstimated(task.estimatedMinutes);
    setFormDeadlineDate(task.deadlineDate || '');
    setFormDeadlineTime(task.deadlineTime || '');
    setFormPrefTime(task.preferredTimeOfDay || 'any');
    setFormMinSession(task.minSessionMinutes || 30);
    setFormCanSplit(task.canSplit);
    setFormNotes(task.personalNotes || '');
    setFormChecklist(task.checklist || []);
    setAiBreakdownMessage(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const taskToSave: Task = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      userId: profile?.uid || 'user',
      title: formTitle.trim(),
      description: formDesc.trim() || undefined,
      category: formCategory,
      priority: formPriority,
      estimatedMinutes: Number(formEstimated) || 30,
      deadlineDate: formDeadlineDate,
      deadlineTime: formDeadlineTime || undefined,
      preferredTimeOfDay: formPrefTime,
      minSessionMinutes: Number(formMinSession) || 15,
      canSplit: formCanSplit,
      isCompleted: editingTask ? editingTask.isCompleted : false,
      completedAt: editingTask ? editingTask.completedAt : undefined,
      checklist: formChecklist,
      personalNotes: formNotes.trim() || undefined,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await upsertTask(taskToSave);
    setIsModalOpen(false);
  };

  // AI Task Breakdown Helper
  const handleAiBreakdown = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a task title first!');
      return;
    }

    setIsBreakingDown(true);
    setAiBreakdownMessage(null);

    try {
      const res = await fetch('/api/ai/breakdown-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          category: formCategory,
          estimatedMinutes: formEstimated,
        }),
      });

      if (!res.ok) throw new Error('Failed to get AI breakdown');
      const data = await res.json();

      if (data.steps && Array.isArray(data.steps)) {
        const generatedItems: TaskChecklistItem[] = data.steps.map((s: any, idx: number) => ({
          id: `step-${Date.now()}-${idx}`,
          text: `${s.text} (~${s.estimatedMinutes}m)`,
          done: false,
        }));
        setFormChecklist([...formChecklist, ...generatedItems]);
        setAiBreakdownMessage(data.encouragement || 'Task sub-steps generated! ✨');
      }
    } catch (err: any) {
      console.error(err);
      // Client-side fallback breakdown
      const fallbackItems: TaskChecklistItem[] = [
        { id: `fb-1-${Date.now()}`, text: 'Review background & formulate approach (20m)', done: false },
        { id: `fb-2-${Date.now()}`, text: 'Core implementation / drafting phase (45m)', done: false },
        { id: `fb-3-${Date.now()}`, text: 'Verification, testing & final polish (15m)', done: false },
      ];
      setFormChecklist([...formChecklist, ...fallbackItems]);
      setAiBreakdownMessage('Generated structured breakdown! ✨');
    } finally {
      setIsBreakingDown(false);
    }
  };

  const handleAddCheckItem = () => {
    if (!newCheckItemText.trim()) return;
    setFormChecklist([
      ...formChecklist,
      { id: `item-${Date.now()}`, text: newCheckItemText.trim(), done: false },
    ]);
    setNewCheckItemText('');
  };

  const handleToggleCheckItem = (id: string) => {
    setFormChecklist(
      formChecklist.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleRemoveCheckItem = (id: string) => {
    setFormChecklist(formChecklist.filter(item => item.id !== id));
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter(t => {
    const matchesQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;

    const isOverdue = Boolean(!t.isCompleted && t.deadlineDate && t.deadlineDate < todayStr);

    let matchesStatus = true;
    if (filterStatus === 'active') matchesStatus = !t.isCompleted && !isOverdue;
    if (filterStatus === 'completed') matchesStatus = t.isCompleted;
    if (filterStatus === 'overdue') matchesStatus = isOverdue;

    return matchesQuery && matchesCategory && matchesPriority && matchesStatus;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'deadline') {
      return (a.deadlineDate || '9999').localeCompare(b.deadlineDate || '9999');
    }
    if (sortBy === 'priority') {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return order[a.priority] - order[b.priority];
    }
    if (sortBy === 'estimated') {
      return b.estimatedMinutes - a.estimatedMinutes;
    }
    return 0;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-pink-500" />
            Personal Task & Deadline Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage university submissions, exam targets, programming routines, and personal projects.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Task
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-pink-100 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, assignments, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-pink-50/30 border border-pink-100 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-300"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map(pri => (
                <option key={pri} value={pri}>
                  {pri} Priority
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-pink-50 text-xs">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: `All (${tasks.length})` },
              { id: 'active', label: `Active (${tasks.filter(t => !t.isCompleted).length})` },
              { id: 'completed', label: `Completed (${tasks.filter(t => t.isCompleted).length})` },
              {
                id: 'overdue',
                label: `Overdue (${tasks.filter(t => !t.isCompleted && t.deadlineDate && t.deadlineDate < todayStr).length})`,
              },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-3 py-1 rounded-xl font-bold transition ${
                  filterStatus === tab.id
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'bg-pink-50/50 text-slate-600 hover:bg-pink-100/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 bg-white border border-pink-100 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="deadline">Deadline Date</option>
              <option value="priority">Priority Level</option>
              <option value="estimated">Estimated Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="bg-white/80 p-12 text-center rounded-3xl border border-pink-100 shadow-xs">
            <CheckSquare className="w-10 h-10 text-pink-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No tasks found matching your filter</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Create a new task to stay organized and achieve your goals.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-pink-500 text-white font-bold rounded-xl text-xs"
            >
              Add Task Now
            </button>
          </div>
        ) : (
          sortedTasks.map(task => {
            const isOverdue = !task.isCompleted && task.deadlineDate && task.deadlineDate < todayStr;
            const completedChecklistCount = task.checklist ? task.checklist.filter(c => c.done).length : 0;
            const totalChecklistCount = task.checklist ? task.checklist.length : 0;

            return (
              <div
                key={task.id}
                className={`bg-white/90 backdrop-blur-sm p-4 rounded-3xl border transition duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs hover:border-pink-300 ${
                  task.isCompleted ? 'opacity-70 bg-slate-50/70' : isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-pink-100'
                }`}
              >
                {/* Left check & info */}
                <div className="flex items-start gap-3.5 flex-1 overflow-hidden">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    aria-label={`Toggle completion for ${task.title}`}
                    className={`mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition shrink-0 ${
                      task.isCompleted
                        ? 'bg-pink-500 border-pink-500 text-white shadow-xs'
                        : 'border-pink-300 hover:border-pink-500 hover:bg-pink-50'
                    }`}
                  >
                    {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 truncate">
                    <div className="flex items-center gap-2">
                      <h4
                        onClick={() => setDetailTask(task)}
                        className={`text-sm font-bold text-slate-800 cursor-pointer hover:text-pink-600 transition truncate ${
                          task.isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {isOverdue && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-extrabold flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3 text-rose-500" /> Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-pink-50 font-semibold text-pink-700 border border-pink-100/60">
                        {task.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedMinutes} mins
                      </span>
                      {task.deadlineDate && (
                        <>
                          <span>•</span>
                          <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            {task.deadlineDate} {task.deadlineTime || ''}
                          </span>
                        </>
                      )}
                      {totalChecklistCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-purple-600 font-semibold flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {completedChecklistCount}/{totalChecklistCount} steps
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right badges & controls */}
                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      task.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : task.priority === 'Medium'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-pink-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                {editingTask ? 'Edit Task' : 'Create Personal Task'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title & AI Breakdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g., Operating Systems Scheduling Assignment"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="flex-1 px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <button
                    type="button"
                    onClick={handleAiBreakdown}
                    disabled={isBreakingDown}
                    className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                    title="Break down into manageable sub-steps with Astra"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    {isBreakingDown ? 'Thinking...' : 'AI Breakdown ✨'}
                  </button>
                </div>
                {aiBreakdownMessage && (
                  <p className="text-[11px] text-purple-600 font-semibold mt-1 bg-purple-50/80 p-2 rounded-lg">
                    {aiBreakdownMessage}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details, rubric points, study material links..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>
                        {p} Priority
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated Minutes & Split Settings */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    min="10"
                    max="600"
                    step="5"
                    value={formEstimated}
                    onChange={e => setFormEstimated(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Chunk (m)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="5"
                    value={formMinSession}
                    onChange={e => setFormMinSession(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer pb-2 text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formCanSplit}
                      onChange={e => setFormCanSplit(e.target.checked)}
                      className="rounded text-pink-500 focus:ring-pink-300 w-4 h-4"
                    />
                    Can Split into Sessions
                  </label>
                </div>
              </div>

              {/* Deadline Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={formDeadlineDate}
                    onChange={e => setFormDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Time (Opt)</label>
                  <input
                    type="time"
                    value={formDeadlineTime}
                    onChange={e => setFormDeadlineTime(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/20 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Sub-task checklist items */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Checklist & Sub-steps ({formChecklist.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add step or milestone..."
                    value={newCheckItemText}
                    onChange={e => setNewCheckItemText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCheckItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-pink-50/20 border border-pink-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCheckItem}
                    className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>

                {formChecklist.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    {formChecklist.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-100 text-xs"
                      >
                        <label className="flex items-center gap-2 cursor-pointer truncate">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => handleToggleCheckItem(item.id)}
                            className="rounded text-pink-500 w-3.5 h-3.5"
                          />
                          <span className={`truncate ${item.done ? 'line-through text-slate-400' : ''}`}>
                            {item.text}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveCheckItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold rounded-xl text-xs shadow-md shadow-pink-200"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 space-y-4">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
                {detailTask.category}
              </span>
              <button onClick={() => setDetailTask(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-800">{detailTask.title}</h3>
              {detailTask.description && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-pink-50/30 p-3 rounded-xl border border-pink-100/50">
                  {detailTask.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-2xl">
              <div>
                <span className="text-slate-400 block">Priority</span>
                <span className="font-bold text-slate-700">{detailTask.priority}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Time</span>
                <span className="font-bold text-slate-700">{detailTask.estimatedMinutes} minutes</span>
              </div>
              <div>
                <span className="text-slate-400 block">Deadline</span>
                <span className="font-bold text-slate-700">
                  {detailTask.deadlineDate || 'None'} {detailTask.deadlineTime || ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Can Split</span>
                <span className="font-bold text-slate-700">{detailTask.canSplit ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {detailTask.checklist && detailTask.checklist.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Checklist Items</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {detailTask.checklist.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        readOnly
                        className="rounded text-pink-500 w-4 h-4"
                      />
                      <span className={item.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
              <button
                onClick={() => {
                  const t = detailTask;
                  setDetailTask(null);
                  handleOpenEdit(t);
                }}
                className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold"
              >
                Edit Task
              </button>
              <button
                onClick={() => setDetailTask(null)}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
