import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AstraMascot } from './AstraMascot.tsx';

export const AuthScreen: React.FC = () => {
  const { loginWithGoogle, authLoading, authError, reducedMotion } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-pink-100/60 via-purple-100/50 to-peach-100/60">
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-md max-w-md w-full p-8 rounded-3xl border border-pink-200/80 shadow-xl shadow-pink-100 text-center space-y-6">
        {/* Soft background aura */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />

        {/* Mascot */}
        <div className="flex justify-center">
          <AstraMascot
            mood="happy"
            size="lg"
            showDialogue={true}
            dialogue="Welcome to ASTRA-PLAN! Sign in with your Google account to get your personal productivity vault ✨"
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight font-['Quicksand'] bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ASTRA-PLAN
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Personal AI Productivity & Time-Intelligence Assistant
          </p>
        </div>

        {/* Multi-User Open Access Badge */}
        <div className="p-3.5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100 text-left text-xs text-slate-600 space-y-1 shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-pink-700">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Open Access • Sign in with any Google account</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Use your Gmail address to log in. Each person gets their own private, isolated cloud database with auto-generated routines, smart schedules, and SGPA targets.
          </p>
        </div>

        {/* Auth Error Display */}
        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="leading-snug">{authError}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={loginWithGoogle}
          disabled={authLoading}
          className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
        >
          {/* Google G logo svg */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.58-5.17 3.58-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        <p className="text-[10px] text-slate-400">
          Secured with Firebase Authentication & Zero-Trust Cloud Firestore Rules
        </p>
      </div>
    </div>
  );
};
