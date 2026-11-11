import React, { useState } from 'react';
import {
  Database,
  Download,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import {
  exportAllDataAsJSON,
  exportTasksToCSV,
  exportEventsToICS,
  deleteAllOwnerData,
} from '../services/dataService.ts';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const { user, tasks, events, refreshAllData, setNotificationMessage } = useApp();

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = async () => {
    if (!user) return;
    const jsonStr = await exportAllDataAsJSON(user.uid);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra-plan-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotificationMessage('Complete JSON archive exported! ✨');
  };

  const handleExportCSV = () => {
    const csvStr = exportTasksToCSV(tasks);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra-plan-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotificationMessage('Tasks exported to CSV format! ✨');
  };

  const handleExportICS = () => {
    const icsStr = exportEventsToICS(events);
    const blob = new Blob([icsStr], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astra-plan-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    link.click();
    URL.revokeObjectURL(url);
    setNotificationMessage('Calendar exported to ICS format! ✨');
  };

  const handleDeleteAll = async () => {
    if (confirmText !== 'DELETE ALL MY DATA') {
      alert('Please type "DELETE ALL MY DATA" exactly to confirm.');
      return;
    }
    setIsDeleting(true);
    try {
      if (user) {
        await deleteAllOwnerData(user.uid);
        await refreshAllData();
        setNotificationMessage('All personal data has been securely deleted from Firestore.');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      alert('Error deleting data: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pink-100 space-y-5">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-pink-500" />
            <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand']">
              Personal Data & Privacy Vault
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 font-bold hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Security Summary */}
        <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p>
            Your data is stored in your private Firestore database path under your authorized Google UID.
            Strict database rules prevent external accounts from reading or modifying your schedules.
          </p>
        </div>

        {/* Export Options */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Export & Backup Personal Data
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleExportJSON}
              className="p-3 rounded-2xl border border-pink-100 hover:border-pink-300 bg-pink-50/30 hover:bg-pink-50 text-left transition flex flex-col justify-between"
            >
              <Download className="w-4 h-4 text-pink-500 mb-2" />
              <div>
                <p className="text-xs font-bold text-slate-800">Complete JSON</p>
                <p className="text-[10px] text-slate-500">Tasks, timetable & profile</p>
              </div>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-3 rounded-2xl border border-purple-100 hover:border-purple-300 bg-purple-50/30 hover:bg-purple-50 text-left transition flex flex-col justify-between"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-500 mb-2" />
              <div>
                <p className="text-xs font-bold text-slate-800">Tasks CSV</p>
                <p className="text-[10px] text-slate-500">Spreadsheet table</p>
              </div>
            </button>

            <button
              onClick={handleExportICS}
              className="p-3 rounded-2xl border border-indigo-100 hover:border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50 text-left transition flex flex-col justify-between"
            >
              <Calendar className="w-4 h-4 text-indigo-500 mb-2" />
              <div>
                <p className="text-xs font-bold text-slate-800">Calendar ICS</p>
                <p className="text-[10px] text-slate-500">Google / Apple Cal</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone: Delete All Data */}
        <div className="pt-3 border-t border-rose-100 space-y-2.5">
          <h4 className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Delete All Owner Records
          </h4>
          <p className="text-[11px] text-slate-500 leading-snug">
            This permanently removes all tasks, timetable slots, routines, focus sessions, and academic records from your Firestore database.
          </p>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">
              Type <span className="font-mono text-rose-600">DELETE ALL MY DATA</span> to confirm:
            </label>
            <input
              type="text"
              placeholder="DELETE ALL MY DATA"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              className="w-full px-3 py-1.5 border border-rose-200 rounded-xl text-xs font-mono"
            />
          </div>

          <button
            onClick={handleDeleteAll}
            disabled={isDeleting || confirmText !== 'DELETE ALL MY DATA'}
            className="w-full py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Deleting...' : 'Permanently Delete My Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
