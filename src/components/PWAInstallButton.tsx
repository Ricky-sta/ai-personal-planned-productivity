import React, { useState } from 'react';
import { Download, Smartphone, Share, CheckCircle2, Sparkles, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';
import { AstraMascot } from './AstraMascot.tsx';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'sidebar' | 'compact' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone, hide or display badge
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Installed on Home Screen</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`p-4 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-lg shadow-pink-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
                Install ASTRA-PLAN to Your Home Screen ✨
              </h4>
              <p className="text-xs text-pink-100">
                Run fullscreen like a native app with zero browser bars, instant offline access, and fast loading.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-5 py-2.5 bg-white hover:bg-pink-50 text-pink-600 font-extrabold rounded-2xl text-xs transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <Download className="w-4 h-4 text-pink-500" />
            Install as App
          </button>
        </div>
      ) : variant === 'sidebar' ? (
        <button
          onClick={handleInstallClick}
          className={`w-full py-2 px-3 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shadow-pink-200 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install to Home Screen</span>
        </button>
      ) : variant === 'compact' ? (
        <button
          onClick={handleInstallClick}
          className={`px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${className}`}
          title="Install ASTRA-PLAN to your Home Screen"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95 text-white rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install App on Home Screen</span>
        </button>
      )}

      {/* Step-by-Step Installation Modal Guide (for iOS Safari, Chrome, and all devices) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pink-100 space-y-5 text-center">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3 text-left">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-pink-500" />
                <h3 className="text-base font-extrabold text-slate-800 font-['Quicksand']">
                  Add ASTRA-PLAN to Home Screen
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex justify-center">
              <AstraMascot
                mood="happy"
                size="md"
                showDialogue={true}
                dialogue="Follow these quick steps to put ASTRA-PLAN right onto your home screen! ✨"
              />
            </div>

            {/* Platform-specific instructions */}
            <div className="space-y-3 text-left bg-pink-50/50 p-4 rounded-2xl border border-pink-100 text-xs text-slate-700">
              {isIOS ? (
                <>
                  <p className="font-bold text-pink-800 flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-pink-600" /> Apple iPhone / iPad Instructions:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium leading-relaxed pl-1">
                    <li>Tap the <strong>Share button</strong> (square with an arrow pointing up) at the bottom or top of Safari.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong> (with the ⊞ plus icon).</li>
                    <li>Tap <strong>"Add"</strong> in the top-right corner.</li>
                  </ol>
                  <p className="text-[11px] text-pink-600 font-semibold mt-2">
                    ASTRA-PLAN will now launch as a dedicated native app with its custom star icon!
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-pink-800 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-pink-600" /> Android / Chrome / Edge Instructions:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 font-medium leading-relaxed pl-1">
                    <li>Tap your browser menu (<strong>three dots ⋮</strong> in the top or bottom corner).</li>
                    <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>Confirm by clicking <strong>"Install"</strong>.</li>
                  </ol>
                  <p className="text-[11px] text-pink-600 font-semibold mt-2">
                    The app will be installed to your device launcher and home screen!
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl text-xs shadow-md shadow-pink-200"
            >
              Got it, let's go! ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
};
