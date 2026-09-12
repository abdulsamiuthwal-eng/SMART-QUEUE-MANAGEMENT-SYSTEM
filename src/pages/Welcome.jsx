import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { Queue3DCanvas } from '../components/Queue3DCanvas';
import { ArrowRight, Languages, Zap, Clock, ShieldCheck } from 'lucide-react';
import bgArt from '../assets/queue_lounge_art.jpg';

export const Welcome = () => {
  const { t, locale, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const logoRef = useRef(null);
  const badgeRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);

  const [isWarping, setIsWarping] = useState(false);

  // GSAP Orchestrated Timeline - immediate smooth reveal without any progress bar delay
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial set
      gsap.set(contentRef.current, { opacity: 1 });
      gsap.set(logoRef.current, { opacity: 0, scale: 0.6, rotation: -20 });
      gsap.set(badgeRef.current, { opacity: 0, scale: 0.85 });
      gsap.set(textRef.current, { opacity: 0, y: 20 });
      gsap.set(ctaRef.current, { opacity: 0, scale: 0.9, y: 15 });
      gsap.set(featuresRef.current, { opacity: 0, y: 15 });

      // 2. Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.85,
        ease: 'elastic.out(1, 0.6)',
      })
      .to(badgeRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
      }, '-=0.45')
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
      }, '-=0.3')
      .to(ctaRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.4)',
      }, '-=0.25')
      .to(featuresRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
      }, '-=0.2');

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const [exitLeft, setExitLeft] = useState(false);

  const handleStart = () => {
    if (exitLeft) return;
    setExitLeft(true);

    // Smoothly slide text & button to the left
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        x: -380,
        opacity: 0,
        duration: 0.62,
        ease: 'power3.in',
      });
    }

    setTimeout(() => {
      navigate('/login');
    }, 580);
  };

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen md:h-screen md:overflow-hidden flex flex-col items-center justify-between p-4 sm:p-6 bg-slate-950 font-sans select-none overflow-y-auto"
    >
      {/* 4K Atmospheric Queue Lounge Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 scale-105 filter blur-[1px] opacity-35"
        style={{ backgroundImage: `url(${bgArt})` }}
      />
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

      {/* Interactive Three.js 3D WebGL Canvas Layer with serpentine exitLeft */}
      <Queue3DCanvas 
        exitLeft={exitLeft}
        speedMultiplier={1.0} 
        interactive={!exitLeft} 
      />

      {/* Floating Top Bar (Language Toggle) */}
      <header className="relative z-30 w-full flex items-center justify-end max-w-5xl pt-2">
        <button
          onClick={toggleLanguage}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 hover:border-amber-400/50 backdrop-blur-md text-white font-bold transition-all cursor-pointer text-xs select-none shadow-xl hover:scale-105 active:scale-95"
        >
          <Languages size={15} className="text-amber-300" />
          <span className="drop-shadow-sm">{locale === 'en' ? 'اردو' : 'English'}</span>
        </button>
      </header>

      {/* Center Floating Elements (No Card / No Box / No Loading Line) */}
      <main 
        ref={contentRef}
        className="relative z-20 w-full max-w-lg my-auto py-6 flex flex-col items-center text-center px-4"
      >
        {/* Glowing 3D Emblem */}
        <div className="flex flex-col items-center mb-4">
          <div ref={logoRef} className="mb-3 filter drop-shadow-[0_0_24px_rgba(245,158,11,0.6)]">
            <SmartQueueLogo size={92} animated={true} />
          </div>
          
          <div 
            ref={badgeRef}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-amber-400/40 backdrop-blur-md text-[11px] font-bold text-amber-200 shadow-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">{locale === 'en' ? 'Smart Healthcare Flow' : 'سمارٹ ہیلتھ کیئر فلو'}</span>
          </div>
        </div>

        {/* Heading and Subtitle */}
        <div ref={textRef} className="mb-7 space-y-2 max-w-md">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {locale === 'en' ? 'Smart Queue' : 'اسمارٹ قطار'}
          </h1>
          <p className="text-sm sm:text-base text-slate-100/95 leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {locale === 'en'
              ? 'Calm, intelligent digital patient flow management for modern healthcare clinics & hospitals.'
              : 'جدید کلینکس اور ہسپتالوں کے لیے پرسکون اور منظم ڈیجیٹل قطار مینیجمنٹ۔'}
          </p>
        </div>

        {/* Immediate Call To Action (No Waiting Line) */}
        <div ref={ctaRef} className="flex flex-col items-center gap-4 w-full max-w-xs">
          <button
            onClick={handleStart}
            className="group w-full flex items-center justify-center gap-3 py-3.5 px-8 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-[0_8px_32px_rgba(229,115,66,0.5)] border border-amber-300/50 transition-all cursor-pointer text-sm tracking-wide select-none hover:scale-105 active:scale-95"
          >
            <span className="font-black text-sm tracking-wide">
              {locale === 'en' ? 'Get Started' : 'شروع کریں'}
            </span>
            <ArrowRight
              size={18}
              className={`transition-transform duration-300 ease-out ${
                locale === 'ur' ? 'rotate-180 group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5'
              }`}
            />
          </button>
        </div>

        {/* Feature Badges */}
        <div ref={featuresRef} className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xl">
            <Zap size={13} className="text-amber-400 shrink-0" />
            <span>{locale === 'en' ? 'Zero Delay' : 'فوری سروس'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xl">
            <Clock size={13} className="text-sky-400 shrink-0" />
            <span>{locale === 'en' ? 'Live Tokens' : 'لائیو ٹوکن'}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xl">
            <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
            <span>{locale === 'en' ? 'Encrypted' : 'محفوظ'}</span>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Welcome;
