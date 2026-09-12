import React from 'react';

/**
 * SmartQueueLogo - Ultra-Executive Brandmark
 * Designed with Gemini precision engineering:
 * - Continuous Mobius 3D Q-Ribbon (Infinity flow & zero waiting time)
 * - Intelligent Healthcare Cross Nucleus (Medical routing & care priority)
 * - Kinetic Supersonic Speed Tail with dual velocity channels
 * - Specular Sapphire Chamfered Base Plate with deep obsidian glass
 * - Live Synchronized Orbital Node with real-time ping radar
 */
export const SmartQueueLogo = ({ 
  size = 48, 
  className = '', 
  animated = false,
  showBadge = false,
  variant = 'icon' // 'icon' | 'full'
}) => {
  return (
    <div 
      className={`relative inline-flex items-center gap-3 select-none group ${className}`}
      style={{ minHeight: size }}
    >
      <div 
        className="relative inline-flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 80 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`w-full h-full filter drop-shadow-[0_12px_28px_rgba(245,158,11,0.35)] transition-all duration-500 ease-out ${
            animated ? 'group-hover:scale-105 group-hover:-translate-y-0.5' : ''
          }`}
        >
          <defs>
            {/* 1. Deep Luxury Obsidian Gradient */}
            <linearGradient id="gemini-plate-grad" x1="8" y1="8" x2="72" y2="72" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#0f172a" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#030712" stopOpacity="1" />
            </linearGradient>

            {/* 2. Specular Diamond-Edge Chamfer */}
            <linearGradient id="gemini-rim-grad" x1="6" y1="6" x2="74" y2="74" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="20%" stopColor="#fef08a" stopOpacity="0.6" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="80%" stopColor="#f59e0b" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.5" />
            </linearGradient>

            {/* 3. Radiant Solar-Amber Q-Loop Gradient */}
            <linearGradient id="gemini-q-grad" x1="16" y1="14" x2="64" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="18%" stopColor="#fef08a" />
              <stop offset="42%" stopColor="#f59e0b" />
              <stop offset="72%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>

            {/* 4. Velocity Supersonic Dart Gradient */}
            <linearGradient id="gemini-arrow-grad" x1="42" y1="42" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            {/* 5. Medical Care Cross Gradient */}
            <linearGradient id="gemini-cross-grad" x1="32" y1="28" x2="48" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* 6. Orbital Real-Time Beacon Gradient */}
            <linearGradient id="gemini-beacon-grad" x1="56" y1="14" x2="68" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* 7. Precision Filters */}
            <filter id="gemini-ambient-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
            </filter>

            <filter id="gemini-core-sharp" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ambient Warm Golden Aura */}
          <circle 
            cx="40" 
            cy="40" 
            r="26" 
            fill="#f59e0b" 
            opacity="0.26" 
            filter="url(#gemini-ambient-glow)" 
          />

          {/* Luxury Obsidian Chamfer Plate */}
          <rect 
            x="5" 
            y="5" 
            width="70" 
            height="70" 
            rx="24" 
            fill="url(#gemini-plate-grad)" 
            stroke="url(#gemini-rim-grad)" 
            strokeWidth="1.75" 
          />

          {/* Diagonal Glass Specular Sheen */}
          <path 
            d="M7 28C7 16.402 16.402 7 28 7H54L7 54V28Z" 
            fill="rgba(255, 255, 255, 0.08)" 
          />

          {/* Inner Precision Flow Ring Guide */}
          <circle 
            cx="38" 
            cy="38" 
            r="23" 
            stroke="rgba(255, 255, 255, 0.09)" 
            strokeWidth="1" 
            strokeDasharray="2.5 3.5" 
          />

          {/* The Infinite Mobius Q-Loop Body */}
          <path 
            d="M38 15C25.2975 15 15 25.2975 15 38C15 50.7025 25.2975 61 38 61C43.765 61 49.027 58.878 53.082 55.378L60.293 62.589C61.658 63.954 63.872 63.954 65.237 62.589C66.602 61.224 66.602 59.01 65.237 57.645L58.204 50.612C60.589 46.994 62 42.664 62 38C62 25.2975 51.7025 15 38 15ZM38 23C46.2843 23 53 29.7157 53 38C53 46.2843 46.2843 53 38 53C29.7157 53 23 46.2843 23 38C23 29.7157 29.7157 23 38 23Z" 
            fill="url(#gemini-q-grad)"
            filter="url(#gemini-core-sharp)"
          />

          {/* Dynamic Velocity Speed Tail Arrow */}
          <path 
            d="M51 51L66 66M66 66H56M66 66V56" 
            stroke="url(#gemini-arrow-grad)" 
            strokeWidth="3.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Supersonic Dual Speed Streams */}
          <line 
            x1="45" y1="59" x2="52" y2="66" 
            stroke="url(#gemini-arrow-grad)" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeOpacity="0.75" 
          />
          <line 
            x1="59" y1="45" x2="66" y2="52" 
            stroke="url(#gemini-arrow-grad)" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeOpacity="0.75" 
          />

          {/* Central Healthcare Beacon Cross */}
          <g filter="url(#gemini-core-sharp)">
            {/* Vertical Arm */}
            <rect 
              x="36" 
              y="27" 
              width="4" 
              height="22" 
              rx="2" 
              fill="url(#gemini-cross-grad)" 
            />
            {/* Horizontal Arm */}
            <rect 
              x="27" 
              y="36" 
              width="22" 
              height="4" 
              rx="2" 
              fill="url(#gemini-cross-grad)" 
            />
            {/* Illuminated Luminous Core Photon */}
            <circle 
              cx="38" 
              cy="38" 
              r="3.2" 
              fill="#ffffff" 
            />
            <circle 
              cx="38" 
              cy="38" 
              r="1.6" 
              fill="#f59e0b" 
            />
          </g>

          {/* Real-Time Live Sync Orbital Beacon (Upper Right Node) */}
          <g className={animated ? "animate-pulse" : ""}>
            {/* Radar Wave Ring */}
            <circle 
              cx="61" 
              cy="19" 
              r="5.5" 
              stroke="#38bdf8" 
              strokeWidth="1" 
              strokeOpacity="0.4" 
              className={animated ? "animate-ping origin-[61px_19px]" : ""}
            />
            {/* Glowing Beacon Core */}
            <circle 
              cx="61" 
              cy="19" 
              r="3.4" 
              fill="url(#gemini-beacon-grad)" 
              stroke="#ffffff" 
              strokeWidth="1.2" 
            />
          </g>

          {/* Micro Precision Priority Node (Lower Left) */}
          <circle 
            cx="19" 
            cy="55" 
            r="2" 
            fill="#fef08a" 
            opacity="0.85" 
          />
        </svg>
      </div>

      {/* Optional Companion Wordmark */}
      {(showBadge || variant === 'full') && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-amber-400 via-amber-200 to-sky-400 bg-clip-text text-transparent">
              Smart Queue
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-black tracking-widest uppercase">
              PRO
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Real-Time Priority Care
          </span>
        </div>
      )}
    </div>
  );
};

export default SmartQueueLogo;
