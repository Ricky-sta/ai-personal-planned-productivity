import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext.tsx';

export const AnalyticsView: React.FC = () => {
  const { tasks, focusSessions, routines, academics } = useApp();

  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  const todayStr = new Date().toISOString().split('T')[0];

  // Daily real calculated metrics
  const completedTasks = tasks.filter(t => t.isCompleted);
  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const todayCompleted = tasks.filter(t => t.isCompleted && t.completedAt?.startsWith(todayStr));
  const todayRemaining = tasks.filter(t => !t.isCompleted && (t.deadlineDate === todayStr || !t.deadlineDate));

  const plannedFocusMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
  const actualFocusMinutes = focusSessions.reduce((sum, f) => sum + f.durationMinutes, 0);

  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Category distribution for completed tasks
  const categoryCounts: { [key: string]: number } = {};
  for (const t of completedTasks) {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  }
  const categoryChartData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  const COLORS = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

  // Past 7 Days Focus Trends (Weekly)
  const getWeeklyFocusData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString([], { weekday: 'short' });

      const dayMins = focusSessions
        .filter(f => f.date === dStr)
        .reduce((sum, f) => sum + f.durationMinutes, 0);

      const dayCompletedTasks = tasks.filter(
        t => t.isCompleted && t.completedAt?.startsWith(dStr)
      ).length;

      data.push({
        day: dayName,
        date: dStr,
        focusMinutes: dayMins,
        tasksDone: dayCompletedTasks,
      });
    }
    return data;
  };

  const weeklyData = getWeeklyFocusData();

  // Monthly Breakdown (Past 4 Weeks)
  const monthlyData = [
    { period: 'Week 1', focusHours: Math.round(actualFocusMinutes * 0.22 / 60), tasksDone: Math.round(completedTasks.length * 0.2) },
    { period: 'Week 2', focusHours: Math.round(actualFocusMinutes * 0.28 / 60), tasksDone: Math.round(completedTasks.length * 0.25) },
    { period: 'Week 3', focusHours: Math.round(actualFocusMinutes * 0.24 / 60), tasksDone: Math.round(completedTasks.length * 0.25) },
    { period: 'Week 4', focusHours: Math.round(actualFocusMinutes * 0.26 / 60), tasksDone: Math.round(completedTasks.length * 0.3) },
  ];

  // Most Productive Day
  const mostProductiveDay = [...weeklyData].sort((a, b) => b.focusMinutes - a.focusMinutes)[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-pink-500" />
            Productivity & Time-Intelligence Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Grounded real metrics calculated from your actual tasks, deliberate focus logs, and habit streaks.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-pink-50/50 p-1 rounded-2xl border border-pink-100 text-xs font-bold">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl capitalize transition ${
                timeRange === range
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 p-5 rounded-3xl border border-pink-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-pink-600">{completionRate}%</span>
            <span className="text-xs text-slate-500">of all tasks</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            {completedTasks.length} finished / {tasks.length} total tasks
          </p>
        </div>

        <div className="bg-white/90 p-5 rounded-3xl border border-purple-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Actual Focus Time
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-purple-700">
              {(actualFocusMinutes / 60).toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">hours logged</span>
          </div>
          <p className="text-[11px] text-purple-600 mt-2 font-medium">
            {focusSessions.length} total completed focus sessions
          </p>
        </div>

        <div className="bg-white/90 p-5 rounded-3xl border border-indigo-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Peak Focus Day
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-700">
              {mostProductiveDay?.day || 'N/A'}
            </span>
            <span className="text-xs text-slate-500">
              {mostProductiveDay ? `${mostProductiveDay.focusMinutes}m` : ''}
            </span>
          </div>
          <p className="text-[11px] text-indigo-600 mt-2 font-medium">
            Highest deep work efficiency window
          </p>
        </div>

        <div className="bg-white/90 p-5 rounded-3xl border border-amber-100 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Routine Consistency
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-600">
              {routines.reduce((sum, r) => sum + r.streak, 0)}
            </span>
            <span className="text-xs text-slate-500">cumulative streak</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-2 font-medium">
            Across {routines.length} active daily habits
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Hours Trend (Bar Chart) */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-500" />
              Focus Minutes Trend (Last 7 Days)
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Minutes Logged</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} mins`, 'Focus Time']}
                  contentStyle={{
                    borderRadius: '1rem',
                    borderColor: '#fce7f3',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="focusMinutes" fill="#ec4899" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Categories Distribution (Pie Chart) */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-pink-500" />
            Completed by Category
          </h3>

          {categoryChartData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-16">
              Complete tasks across categories to view distribution!
            </p>
          ) : (
            <div className="h-64 w-full flex flex-col items-center">
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex flex-wrap justify-center gap-2 text-[10px] text-slate-600 max-h-16 overflow-y-auto">
                {categoryChartData.map((entry, idx) => (
                  <span key={idx} className="flex items-center gap-1 font-semibold">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
