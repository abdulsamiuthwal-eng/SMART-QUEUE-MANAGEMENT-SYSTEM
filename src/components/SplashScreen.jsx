import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { SmartQueueLogo } from './SmartQueueLogo';
import { Queue3DCanvas } from './Queue3DCanvas';
import { ShieldCheck, Sparkles, Activity, RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import bgArt from '../assets/queue_lounge_art.webp';

/**
 * SplashScreen
 * High-end cinematic splash screen driven by GSAP timeline orchestrations
 * and real-time interactive Three.js 3D WebGL particle graphics with full transparency and NO loading line.
 */
export const SplashScreen = ({ 
  show = true, 
  onComplete, 
  standalone = false 
}) => {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const titleRef = useRef(null);
  const statusBadgeRef = useRef(null);
  const statusTextRef = useRef(null);
  const glowRingRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Staged authentication & syncing steps
  const steps = [
    {
      en: 'Connecting 3D Quantum Engine...',
      ur: 'اسمارٹ قطار سسٹم کا آغاز...',
      icon: Activity,
    },
    {
      en: 'Syncing Real-Time Clinic Flow...',
      ur: 'کلینک نیٹ ورک کی ہم آہنگی...',
      icon: Sparkles,
    },
    {
      en: 'Verifying Encrypted Session...',
      ur: 'محفوظ سیشن اور تصدیق فعال...',
      icon: ShieldCheck,
    },
    {
      en: 'Welcome! Launching Workspace...',
      ur: 'سسٹم تیار ہے، خوش آمدید...',
      icon: CheckCircle2,
    },
  ];

  useEffect(() => {
    if (!show) return;

    setIsWarping(false);
    setIsFinished(false);
    setCurrentStep(0);

    // Setup GSAP context for strict React 19 cleanup
    const ctx = gsap.context(() => {
      // 1. Initial State resets
      gsap.set(containerRef.current, { opacity: 1, visibility: 'visible' });
      gsap.set(cardRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 25,
      });
      gsap.set(logoWrapperRef.current, { scale: 0.6, opacity: 0, rotation: -45 });
      gsap.set(titleRef.current, { opacity: 0, y: 15 });
      gsap.set(statusBadgeRef.current, { opacity: 0, scale: 0.85 });

      // 2. Main Orchestrated GSAP Timeline
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      // Floating Elements Entrance
      tl.to(cardRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.7,
        ease: 'back.out(1.2)',
      })
      // Logo Unfolding & Spin
      .to(logoWrapperRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.6)',
      }, '-=0.5')
      // Title & Subtitle Stagger
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.45,
      }, '-=0.35')
      // Status Badge Reveal
      .to(statusBadgeRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
      }, '-=0.25');

      // Continuous ambient glow pulsation in background
      gsap.to(glowRingRef.current, {
        scale: 1.3,
        opacity: 0.25,
        duration: 2.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Rapid staged step transitions (no loading line delay)
      tl.call(() => setCurrentStep(1), null, '+=0.3')
        .call(() => setCurrentStep(2), null, '+=0.35')
        .call(() => setCurrentStep(3), null, '+=0.35')
        .call(() => {
          setIsWarping(true);
          setIsFinished(true);

          if (!standalone) {
            // Smooth exit transition
            gsap.timeline()
              .to(cardRef.current, {
                scale: 1.08,
                opacity: 0,
                y: -25,
                duration: 0.35,
                ease: 'power2.in',
              })
              .to(containerRef.current, {
                opacity: 0,
                duration: 0.35,
                ease: 'power2.out',
                onComplete: () => {
                  if (onComplete) onComplete();
                },
              }, '-=0.1');
          }
        }, null, '+=0.3');

    }, containerRef);

    return () => ctx.revert();
  }, [show, onComplete, standalone, replayKey]);

  if (!show) return null;

  const CurrentIcon = steps[currentStep].icon;

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden"
    >
      {/* 4K Atmospheric Background Art */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 filter blur-[1px] opacity-35"
        style={{ backgroundImage: `url(${bgArt})` }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

      {/* Interactive Three.js 3D WebGL Canvas Layer - Full screen & completely unobstructed */}
      <Queue3DCanvas 
        warp={isWarping} 
        speedMultiplier={isWarping ? 3.5 : 1} 
        interactive={true} 
      />

      {/* Floating Ambient Glow */}
      <div 
        ref={glowRingRef}
        className="absolute w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-3xl pointer-events-none z-10" 
      />

      {/* Center Floating Elements - NO CARD / NO LOADING LINE */}
      <div
        ref={cardRef}
        className="relative z-20 w-full max-w-md mx-4 p-4 text-center flex flex-col items-center"
      >
        {/* 3D Animated Emblem */}
        <div ref={logoWrapperRef} className="relative mb-4 flex items-center justify-center">
          <div className="absolute -inset-4 bg-amber-500/25 rounded-full blur-2xl animate-pulse" />
          <div className="filter drop-shadow-[0_0_24px_rgba(245,158,11,0.6)]">
            <SmartQueueLogo size={88} animated={true} />
          </div>
        </div>

        {/* Brand Title with strong drop-shadow */}
        <div ref={titleRef} className="space-y-1 mb-5">
          <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {locale === 'en' ? 'Smart Queue' : 'اسمارٹ قطار'}
          </h2>
          <p className="text-[11px] text-slate-200 font-semibold tracking-widest uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {locale === 'en' ? 'Healthcare Intelligence • 3D Core' : 'ہیلتھ کیئر قطار مینیجمنٹ'}
          </p>
        </div>

        {/* Dynamic GSAP Staged Status Pill (Quick & Responsive) */}
        <div
          ref={statusBadgeRef}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/55 border border-amber-400/40 backdrop-blur-md text-xs font-bold text-amber-300 shadow-2xl transition-all duration-300"
        >
          <CurrentIcon size={15} className="text-amber-400 animate-spin-slow shrink-0" />
          <span ref={statusTextRef} className="drop-shadow-sm font-medium">
            {locale === 'en' ? steps[currentStep].en : steps[currentStep].ur}
          </span>
        </div>

        {/* Standalone Preview Controls (for testing & direct URL preview /splash) */}
        {standalone && isFinished && (
          <div className="mt-8 pt-4 w-full flex items-center justify-center gap-3">
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white text-xs font-bold hover:text-amber-300 cursor-pointer backdrop-blur-md transition-all shadow-xl hover:scale-105"
            >
              <RotateCcw size={13} className="text-amber-400" />
              <span>{locale === 'en' ? 'Replay Animation' : 'دوبارہ دیکھیں'}</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 text-xs font-black cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105"
            >
              <span>{locale === 'en' ? 'Go to Login' : 'لاگ ان صفحہ'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default SplashScreen;
