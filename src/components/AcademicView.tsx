import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AcademicGoal } from '../types/index.ts';
import { fireAchievementBurst } from '../utils/confetti.ts';

export const AcademicView: React.FC = () => {
  const { academics, upsertAcademic, removeAcademic, logStudyHours, profile, updateProfile, setNotificationMessage } = useApp();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [currentTargetInput, setCurrentTargetInput] = useState<number>(profile?.targetSGPA || 9.0);
  const [currentSGPAInput, setCurrentSGPAInput] = useState<number>(profile?.currentSGPA || 8.75);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AcademicGoal | null>(null);
  const [formSubject, setFormSubject] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCredits, setFormCredits] = useState<number>(4);
  const [formGrade, setFormGrade] = useState('A+');
  const [formPlanned, setFormPlanned] = useState<number>(35);
  const [formExamDate, setFormExamDate] = useState('');
  const [formExamType, setFormExamType] = useState('Mid-Term Exam');
  const [formSemester, setFormSemester] = useState('Semester 5');

  // Study log modal
  const [loggingGoal, setLoggingGoal] = useState<AcademicGoal | null>(null);
  const [studyHoursToAdd, setStudyHoursToAdd] = useState<number>(2);

  const targetSGPA = profile?.targetSGPA || 9.0;
  const currentSGPA = profile?.currentSGPA || 8.75;
  const distance = Math.max(0, targetSGPA - currentSGPA);

  const totalPlannedHours = academics.reduce((sum, a) => sum + a.plannedHours, 0);
  const totalCompletedHours = academics.reduce((sum, a) => sum + a.completedHours, 0);
  const studyProgressPercent = totalPlannedHours > 0 ? Math.round((totalCompletedHours / totalPlannedHours) * 100) : 0;

  const handleSaveSGPA = async () => {
    await updateProfile({
      targetSGPA: Number(currentTargetInput),
      currentSGPA: Number(currentSGPAInput),
    });
    setIsEditingTarget(false);
    if (Number(currentSGPAInput) >= Number(currentTargetInput)) {
      fireAchievementBurst();
      setNotificationMessage('✨ Star Achiever! Target SGPA milestone reached! Astra is cheering for you!');
    }
  };

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setFormSubject('');
    setFormCode('');
    setFormCredits(4);
    setFormGrade('A+');
    setFormPlanned(35);
    setFormExamDate('');
    setFormExamType('Mid-Term Exam');
    setFormSemester('Semester 5');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: AcademicGoal) => {
    setEditingGoal(goal);
    setFormSubject(goal.subjectName);
    setFormCode(goal.subjectCode || '');
    setFormCredits(goal.credits);
    setFormGrade(goal.targetGrade || 'A+');
    setFormPlanned(goal.plannedHours);
    setFormExamDate(goal.examDate || '');
    setFormExamType(goal.examType || 'Mid-Term Exam');
    setFormSemester(goal.semester);
    setIsModalOpen(true);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim()) return;

    const goalToSave: AcademicGoal = {
      id: editingGoal ? editingGoal.id : `acad-${Date.now()}`,
      userId: profile?.uid || 'user',
      subjectName: formSubject.trim(),
      subjectCode: formCode.trim() || undefined,
      credits: Number(formCredits),
      targetGrade: formGrade,
      plannedHours: Number(formPlanned),
      completedHours: editingGoal ? editingGoal.completedHours : 0,
      examDate: formExamDate || undefined,
      examType: formExamType,
      semester: formSemester,
      updatedAt: new Date().toISOString(),
    };

    await upsertAcademic(goalToSave);
    setIsModalOpen(false);
  };

  const handleLogHours = async () => {
    if (!loggingGoal) return;
    await logStudyHours(loggingGoal.id, Number(studyHoursToAdd));
    setLoggingGoal(null);
    setNotificationMessage(`Logged ${studyHoursToAdd} study hours for ${loggingGoal.subjectName}! 🌸`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-purple-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            Academic Goal & SGPA Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track university courses, internal examinations, SGPA targets, and deliberate study hours.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-200 transition"
        >
          <Plus className="w-4 h-4" />
          Add Subject Goal
        </button>
      </div>

      {/* SGPA & Academic Progress Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SGPA Target Card */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6 rounded-3xl border border-purple-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
              SGPA Target Engine
            </span>
            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditingTarget ? 'Cancel' : 'Edit Targets'}
            </button>
          </div>

          {!isEditingTarget ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-slate-800">{currentSGPA.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 ml-1">Current SGPA</span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-purple-700">{targetSGPA.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 ml-1">Goal</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-purple-200/60 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (currentSGPA / targetSGPA) * 100)}%` }}
                />
              </div>

              <p className="text-xs text-purple-900 font-semibold flex items-center gap-1.5 pt-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                {distance === 0
                  ? 'Goal achieved! Maintaining academic excellence ✨'
                  : `${distance.toFixed(2)} SGPA points to reach your target milestone!`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 bg-white/90 p-4 rounded-2xl border border-purple-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Current SGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={currentSGPAInput}
                  onChange={e => setCurrentSGPAInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-purple-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Target SGPA (Default 9.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={currentTargetInput}
                  onChange={e => setCurrentTargetInput(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-purple-200 rounded-xl text-xs font-bold"
                />
              </div>
              <button
                onClick={handleSaveSGPA}
                className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
              >
                Save SGPA Targets
              </button>
            </div>
          )}
        </div>

        {/* Study Hours Progress */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Semester Study Hours
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-800">{totalCompletedHours}</span>
              <span className="text-xs text-slate-500">/ {totalPlannedHours} planned hours</span>
            </div>
            <div className="w-full bg-pink-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${studyProgressPercent}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-pink-600 font-semibold mt-3">
            {studyProgressPercent}% of total deliberate study commitments logged
          </p>
        </div>

        {/* Upcoming Examinations Count */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-indigo-100 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam Milestones
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-700">
                {academics.filter(a => Boolean(a.examDate)).length}
              </span>
              <span className="text-xs text-slate-500">exams scheduled</span>
            </div>
          </div>
          <p className="text-xs text-indigo-600 font-semibold mt-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-500" />
            Keep revision steady to stay calm during exam weeks!
          </p>
        </div>
      </div>

      {/* Courses & Subject Goals List */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-purple-100 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand'] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-500" />
          Course Records & Subject Study Hours
        </h3>

        {academics.length === 0 ? (
          <div className="text-center py-8 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200">
            <BookOpen className="w-8 h-8 text-purple-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No academic courses added yet.</p>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              Add your current semester subjects and credits to track study progress.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold"
            >
              Add First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academics.map(goal => {
              const progress = goal.plannedHours > 0 ? Math.round((goal.completedHours / goal.plannedHours) * 100) : 0;
              return (
                <div
                  key={goal.id}
                  className="bg-white p-4 rounded-2xl border border-purple-100/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-purple-300 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{goal.subjectName}</h4>
                        <p className="text-[10px] text-purple-700 font-semibold mt-0.5">
                          {goal.subjectCode ? `${goal.subjectCode} • ` : ''}{goal.credits} Credits • Target: {goal.targetGrade}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(goal)}
                          className="p-1 text-slate-400 hover:text-purple-600"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeAcademic(goal.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Study Hours Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Study Progress:</span>
                        <span>{goal.completedHours} / {goal.plannedHours} hrs</span>
                      </div>
                      <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-600 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Upcoming Exam info */}
                    {goal.examDate && (
                      <div className="mt-3 p-2 bg-rose-50/70 border border-rose-100 rounded-xl text-[11px] text-rose-800 font-medium">
                        <span className="font-bold">{goal.examType}:</span> {goal.examDate}
                      </div>
                    )}
                  </div>

                  {/* Log Study Hours Button */}
                  <button
                    onClick={() => {
                      setLoggingGoal(goal);
                      setStudyHoursToAdd(2);
                    }}
                    className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold rounded-xl text-xs transition"
                  >
                    + Log Study Hours
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Hours Modal */}
      {loggingGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800">
              Log Study Hours for {loggingGoal.subjectName}
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hours Studied Today</label>
              <input
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={studyHoursToAdd}
                onChange={e => setStudyHoursToAdd(Number(e.target.value))}
                className="w-full px-3 py-2 border border-purple-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLoggingGoal(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleLogHours}
                className="px-4 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs"
              >
                Record Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand']">
                {editingGoal ? 'Edit Academic Goal' : 'Add Subject Goal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CS301"
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formCredits}
                    onChange={e => setFormCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Grade</label>
                  <select
                    value={formGrade}
                    onChange={e => setFormGrade(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    {['O (10)', 'A+ (9)', 'A (8)', 'B+ (7)', 'B (6)'].map(g => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Planned Study Hours</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={formPlanned}
                    onChange={e => setFormPlanned(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upcoming Exam Date</label>
                  <input
                    type="date"
                    value={formExamDate}
                    onChange={e => setFormExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Exam Type</label>
                  <input
                    type="text"
                    placeholder="Mid-Term / Internal Test"
                    value={formExamType}
                    onChange={e => setFormExamType(e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
