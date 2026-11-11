import React from 'react';

export type MascotMood = 'happy' | 'encouraging' | 'calm' | 'celebratory' | 'thinking';

interface AstraMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDialogue?: boolean;
  dialogue?: string;
  className?: string;
  reducedMotion?: boolean;
}

export const AstraMascot: React.FC<AstraMascotProps> = ({
  mood = 'happy',
  size = 'md',
  showDialogue = false,
  dialogue,
  className = '',
  reducedMotion = false,
}) => {
  const sizeMap = {
    sm: { w: 64, h: 64, text: 'text-xs' },
    md: { w: 100, h: 100, text: 'text-xs' },
    lg: { w: 150, h: 150, text: 'text-sm' },
    xl: { w: 210, h: 210, text: 'text-base' },
  };

  const currentSize = sizeMap[size];

  // Mascot expressive attributes based on mood
  const getMoodColors = () => {
    switch (mood) {
      case 'calm':
        return { aura: '#c4b5fd', blush: '#fbcfe8', hairAcc: '#818cf8', eyes: '#4f46e5' };
      case 'celebratory':
        return { aura: '#fde047', blush: '#fda4af', hairAcc: '#f43f5e', eyes: '#e11d48' };
      case 'encouraging':
        return { aura: '#fed7aa', blush: '#fecdd3', hairAcc: '#fb923c', eyes: '#ea580c' };
      case 'thinking':
        return { aura: '#a7f3d0', blush: '#fbcfe8', hairAcc: '#34d399', eyes: '#059669' };
      case 'happy':
      default:
        return { aura: '#fbcfe8', blush: '#fda4af', hairAcc: '#ec4899', eyes: '#db2777' };
    }
  };

  const colors = getMoodColors();

  return (
    <div className={`relative inline-flex items-center gap-3 ${className}`}>
      {/* Floating Mascot Graphic */}
      <div
        className={`relative select-none ${
          !reducedMotion ? 'transition-transform duration-700 hover:scale-105' : ''
        }`}
        style={{ width: currentSize.w, height: currentSize.h }}
      >
        <svg
          viewBox="0 0 160 160"
          className={`w-full h-full drop-shadow-md ${
            !reducedMotion ? (mood === 'celebratory' ? 'animate-bounce' : 'animate-pulse') : ''
          }`}
          style={{ animationDuration: mood === 'celebratory' ? '1s' : '3.5s' }}
        >
          <defs>
            <radialGradient id={`aura-${mood}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={colors.aura} stopOpacity="0.45" />
              <stop offset="70%" stopColor={colors.aura} stopOpacity="0.15" />
              <stop offset="100%" stopColor={colors.aura} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fdf2f8" />
              <stop offset="60%" stopColor="#fce7f3" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
            <linearGradient id="dressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ede9fe" />
              <stop offset="100%" stopColor="#fbcfe8" />
            </linearGradient>
          </defs>

          {/* Soft Glowing Aura */}
          <circle cx="80" cy="80" r="76" fill={`url(#aura-${mood})`} />

          {/* Floating Stardust Petals */}
          <g opacity="0.8">
            <circle cx="28" cy="40" r="3" fill="#f472b6" />
            <circle cx="132" cy="50" r="2.5" fill="#c084fc" />
            <polygon points="125,30 128,36 134,36 129,40 131,46 125,42 119,46 121,40 116,36 122,36" fill="#fcd34d" />
            <polygon points="34,120 36,124 40,124 37,127 38,131 34,128 30,131 31,127 28,124 32,124" fill="#fb7185" />
          </g>

          {/* Body & Cute Capelet */}
          <path
            d="M58,110 Q80,105 102,110 L112,148 Q80,154 48,148 Z"
            fill="url(#dressGrad)"
            stroke="#e9d5ff"
            strokeWidth="2"
          />
          {/* Collar ribbon */}
          <path d="M72,112 L80,122 L88,112 Z" fill={colors.hairAcc} />
          <circle cx="80" cy="116" r="3.5" fill="#fef08a" />

          {/* Little Floating Hands */}
          {mood === 'celebratory' ? (
            <>
              {/* Hands raised in joy */}
              <circle cx="44" cy="95" r="7" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
              <circle cx="116" cy="95" r="7" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
            </>
          ) : mood === 'encouraging' ? (
            <>
              {/* One fist forward, one waving */}
              <circle cx="48" cy="118" r="7" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
              <circle cx="114" cy="110" r="8" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
              {/* Mini magic star wand */}
              <line x1="116" y1="110" x2="132" y2="88" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
              <polygon points="132,84 134,88 138,88 135,90 136,94 132,92 128,94 129,90 126,88 130,88" fill="#fbbf24" />
            </>
          ) : (
            <>
              {/* Relaxed hands clasped politely */}
              <circle cx="68" cy="125" r="6" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
              <circle cx="92" cy="125" r="6" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1.5" />
            </>
          )}

          {/* Head & Face */}
          <ellipse cx="80" cy="74" rx="42" ry="38" fill="#fff5f5" stroke="#ffe4e6" strokeWidth="1.5" />

          {/* Cute Anime Hair Base & Twintails */}
          <path
            d="M38,72 C22,85 18,118 36,134 C30,118 36,95 44,84 Z"
            fill="url(#hairGrad)"
            stroke="#fbcfe8"
            strokeWidth="1.5"
          />
          <path
            d="M122,72 C138,85 142,118 124,134 C130,118 124,95 116,84 Z"
            fill="url(#hairGrad)"
            stroke="#fbcfe8"
            strokeWidth="1.5"
          />

          {/* Hair Bangs */}
          <path
            d="M38,70 C40,40 60,34 80,34 C100,34 120,40 122,70 C114,56 102,52 94,62 C88,54 82,54 78,62 C70,52 52,56 38,70 Z"
            fill="url(#hairGrad)"
            stroke="#fbcfe8"
            strokeWidth="1.5"
          />

          {/* Twin Star Hairpins */}
          <polygon points="45,48 48,53 54,53 49,56 51,62 45,58 39,62 41,56 36,53 42,53" fill="#fde047" stroke="#f59e0b" strokeWidth="1" />
          <polygon points="115,48 118,53 124,53 119,56 121,62 115,58 109,62 111,56 106,53 112,53" fill="#fde047" stroke="#f59e0b" strokeWidth="1" />

          {/* Rosy Anime Blushes */}
          <ellipse cx="58" cy="84" rx="9" ry="5" fill={colors.blush} opacity="0.8" />
          <ellipse cx="102" cy="84" rx="9" ry="5" fill={colors.blush} opacity="0.8" />
          {/* Subtle blush lines */}
          <line x1="55" y1="83" x2="61" y2="85" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1="99" y1="83" x2="105" y2="85" stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

          {/* Expressive Eyes */}
          {mood === 'calm' ? (
            // Serene smiling eyes ^_^
            <>
              <path d="M54,76 Q64,68 72,76" fill="none" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" />
              <path d="M88,76 Q96,68 106,76" fill="none" stroke="#4c1d95" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : mood === 'celebratory' ? (
            // Sparkling star eyes!
            <>
              <ellipse cx="63" cy="74" rx="9" ry="11" fill="#be185d" />
              <ellipse cx="97" cy="74" rx="9" ry="11" fill="#be185d" />
              <polygon points="63,68 64,72 68,72 65,74 66,78 63,75 60,78 61,74 58,72 62,72" fill="#fff" />
              <polygon points="97,68 98,72 102,72 99,74 100,78 97,75 94,78 95,74 92,72 96,72" fill="#fff" />
            </>
          ) : (
            // Bright sparkling anime eyes
            <>
              <ellipse cx="63" cy="74" rx="8" ry="10" fill={colors.eyes} />
              <ellipse cx="97" cy="74" rx="8" ry="10" fill={colors.eyes} />
              {/* Primary highlight */}
              <circle cx="61" cy="70" r="3.2" fill="#ffffff" />
              <circle cx="95" cy="70" r="3.2" fill="#ffffff" />
              {/* Secondary soft highlight */}
              <circle cx="65" cy="78" r="1.8" fill="#ffffff" opacity="0.8" />
              <circle cx="99" cy="78" r="1.8" fill="#ffffff" opacity="0.8" />
              {/* Upper eyeliner lashes */}
              <path d="M53,68 Q63,62 72,67" fill="none" stroke="#312e81" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M88,67 Q97,62 107,68" fill="none" stroke="#312e81" strokeWidth="2.5" strokeLinecap="round" />
            </>
          )}

          {/* Mouth */}
          {mood === 'happy' || mood === 'celebratory' ? (
            <path d="M74,86 Q80,94 86,86" fill="#f43f5e" stroke="#e11d48" strokeWidth="1.2" strokeLinecap="round" />
          ) : mood === 'encouraging' ? (
            <path d="M75,87 Q80,92 85,87" fill="none" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <ellipse cx="80" cy="88" rx="2" ry="1.5" fill="#f43f5e" />
          )}
        </svg>
      </div>

      {/* Anime Speech Bubble Dialogue */}
      {showDialogue && dialogue && (
        <div
          className={`relative bg-white/95 backdrop-blur-sm border border-pink-200/80 rounded-2xl px-3.5 py-2 text-slate-700 shadow-sm shadow-pink-100 max-w-xs ${currentSize.text}`}
        >
          {/* Bubble beak */}
          <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-l border-b border-pink-200/80" />
          <p className="font-medium leading-relaxed relative z-10">{dialogue}</p>
        </div>
      )}
    </div>
  );
};
