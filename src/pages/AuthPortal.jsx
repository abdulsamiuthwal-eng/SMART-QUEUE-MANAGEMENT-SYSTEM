import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { Queue3DCanvas } from '../components/Queue3DCanvas';
import { SplashScreen } from '../components/SplashScreen';
import {
  ArrowRight,
  ArrowLeft,
  Languages,
  Zap,
  Clock,
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import bgArt from '../assets/queue_lounge_art.webp';

/**
 * AuthPortal
 * Senior-developer unified continuous stage architecture for Welcome & Login.
 * Eliminates all route gaps and black-screen flashes by keeping the 4K canvas
 * and Three.js 3D viewport persistent, while sliding the login cards seamlessly
 * from off-screen right into view as the 3D knot snaps open and slithers left.
 */
export const AuthPortal = ({ initialView = 'welcome' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { t, locale, toggleLanguage } = useLanguage();

  const isInitialLogin = location.pathname === '/login' || initialView === 'login';
  const [isLogin, setIsLogin] = useState(isInitialLogin);
  const [hasUserTransitioned, setHasUserTransitioned] = useState(false);

  // Sync state with route changes and popstate (browser back/forward)
  useEffect(() => {
    const syncRoute = () => {
      if (window.location.pathname === '/login') {
        setIsLogin(true);
      } else if (window.location.pathname === '/') {
        setIsLogin(false);
      }
    };
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [location.pathname]);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [destPath, setDestPath] = useState('');

  // Handle click on "Get Started" -> snaps 3D snake & drags login screen in from right
  const handleGetStarted = () => {
    setHasUserTransitioned(true);
    setIsLogin(true);
    window.history.pushState(null, '', '/login');
  };

  // Handle back to welcome screen (slides back to the right)
  const handleBackToWelcome = () => {
    setHasUserTransitioned(true);
    setIsLogin(false);
    window.history.pushState(null, '', '/');
  };

  const handleLoginSuccess = (user) => {
    const path = user.role === 'org' ? '/org-dashboard' : '/patient-dashboard';
    setDestPath(path);
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    navigate(destPath, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      handleLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError(t('auth.invalidCreds'));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      handleLoginSuccess(user);
    } catch (err) {
      console.error(err);
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    setError('');
    if (role === 'patient') {
      setEmail('patient@demo.com');
      setPassword('demo123');
    } else {
      setEmail('clinic@demo.com');
      setPassword('demo123');
    }
  };

  return (
    <div dir="ltr" className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#0c1524] via-[#080d16] to-[#04060a] font-sans select-none">
      {/* 1. PERSISTENT ATMOSPHERIC BACKGROUND - 100% Crisp & Zero Black Flash */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 transition-opacity duration-300 ease-out"
        style={{ backgroundImage: `url(${bgArt})` }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* 2. UNIVERSAL FLOATING LANGUAGE TOGGLE (Fixed Top-Right) */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={toggleLanguage}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 hover:border-amber-400/50 backdrop-blur-md text-white font-bold transition-all cursor-pointer text-xs select-none shadow-xl hover:scale-105 active:scale-95"
        >
          <Languages size={15} className="text-amber-300" />
          <span className="drop-shadow-sm">{locale === 'en' ? 'اردو' : 'English'}</span>
        </button>
      </div>

      {/* 3. CONTINUOUS HORIZONTAL STAGE TRACK (200vw) - Dedicated GPU Composited Layer Anchored to Left:0 */}
      <div 
        dir="ltr"
        className={`absolute left-0 top-0 flex w-[200vw] h-full transform-gpu will-change-transform ${
          hasUserTransitioned ? 'transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
        }`}
        style={{ 
          transform: isLogin ? 'translate3d(-100vw, 0, 0)' : 'translate3d(0vw, 0, 0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      >
        {/* ================= STAGE 1: GET STARTED / WELCOME (100vw) ================= */}
        <section 
          dir="ltr"
          className={`w-screen h-screen shrink-0 relative z-10 flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden ${locale === 'ur' ? 'lang-ur' : ''}`}
        >
          {/* Three.js 3D WebGL Canvas Layer - Attached strictly to Stage 1, swipes off to the left! */}
          <Queue3DCanvas 
            exitLeft={isLogin} 
            speedMultiplier={1.0} 
            interactive={!isLogin} 
            className="z-0 pointer-events-none"
          />

          <div className="w-full max-w-5xl h-6 relative z-10" />

          {/* Floating Center Hero Elements (In front of 3D canvas backdrop) */}
          <div className="w-full max-w-lg my-auto py-6 flex flex-col items-center text-center px-4 relative z-20 pointer-events-auto">
            {/* Glowing 3D Emblem */}
            <div className="flex flex-col items-center mb-4">
              <div className="mb-3 filter drop-shadow-[0_0_24px_rgba(245,158,11,0.6)]">
                <SmartQueueLogo size={92} animated={true} />
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/55 border border-amber-400/40 backdrop-blur-md text-[11px] font-bold text-amber-200 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-wide">
                  {t('welcome.badge')}
                </span>
              </div>
            </div>

            {/* Heading and Subtitle */}
            <div className="mb-8 space-y-2 max-w-md">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                {t('welcome.title')}
              </h1>
              <p className="text-sm sm:text-base text-slate-100/95 leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                {t('welcome.subtitle')}
              </p>
            </div>

            {/* "Get Started" CTA Button (Triggers 3D Snake Snap & Right-to-Left Stage Drag) */}
            <div className="flex flex-col items-center gap-4 w-full max-w-xs relative z-30 pointer-events-auto">
              <button
                id="get-started-btn"
                type="button"
                onClick={handleGetStarted}
                className="group w-full flex items-center justify-center gap-3 py-3.5 px-8 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-[0_8px_32px_rgba(229,115,66,0.5)] border border-amber-300/50 transition-all cursor-pointer text-sm tracking-wide select-none hover:scale-105 active:scale-95 relative z-30 pointer-events-auto"
              >
                <span className="font-black text-sm tracking-wide">
                  {t('welcome.getStarted')}
                </span>
                <ArrowRight
                  size={18}
                  className={`transition-transform duration-300 ease-out ${
                    locale === 'ur' ? 'rotate-180 group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5'
                  }`}
                />
              </button>
            </div>

            {/* Floating Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8 relative z-20 pointer-events-auto">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xl">
                <Zap size={13} className="text-amber-400 shrink-0" />
                <span>{t('welcome.zeroDelay')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xl">
                <Clock size={13} className="text-sky-400 shrink-0" />
                <span>{t('welcome.liveTokens')}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xl">
                <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                <span>{t('welcome.encrypted')}</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-5xl h-4" />
        </section>

        {/* ================= STAGE 2: LOGIN CARDS (100vw) ================= */}
        {/* Layout direction is locked to LTR so cards stay firmly anchored on left and right */}
        <section 
          dir="ltr"
          className="w-screen h-screen shrink-0 relative z-10 flex flex-col md:flex-row items-center justify-between p-3 sm:p-6 lg:p-10 overflow-y-auto"
        >
          {/* Back to Welcome Screen Pill (Firmly anchored Top-Left) */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-40">
            <button
              type="button"
              onClick={handleBackToWelcome}
              className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 hover:border-amber-400/50 backdrop-blur-md text-white font-bold transition-all cursor-pointer text-[11px] sm:text-xs select-none shadow-xl hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={14} className="text-amber-300 transition-transform group-hover:-translate-x-1" />
              <span>{t('login.home')}</span>
            </button>
          </div>

          {/* LEFT SIDE: Expanded Scenic Branding Card (Stays firmly on the Left) */}
          <div dir="ltr" className={`hidden md:flex flex-1 flex-col justify-between self-stretch py-6 pl-4 pr-8 z-10 max-w-2xl transform-gpu ${locale === 'ur' ? 'lang-ur' : ''}`}>
            <div className="flex items-center gap-3.5 pt-2">
              <SmartQueueLogo size={52} animated={true} />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                  {t('login.appName')}
                </h1>
                <p className="text-[11px] text-amber-300/90 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <span>{t('login.brandFlow')}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </p>
              </div>
            </div>

            {/* Ambient Info Card */}
            <div 
              style={{ backdropFilter: 'blur(16px) saturate(145%)', WebkitBackdropFilter: 'blur(16px) saturate(145%)' }}
              className="w-full max-w-xl space-y-3.5 p-6 lg:p-7 rounded-[30px] glass-acrylic-card transform-gpu relative overflow-hidden"
            >
              <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/35 text-[11px] font-bold text-amber-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('login.realTimeBadge')}</span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-white leading-snug drop-shadow-md">
                {t('login.heading')}
              </h2>

              <p className="text-xs text-slate-200/95 leading-relaxed font-medium">
                {t('login.desc')}
              </p>

              {/* Feature Badges */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200">
                  <Zap size={14} className="text-amber-400 shrink-0" />
                  <span className="truncate">{t('login.instantTokens')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200">
                  <Clock size={14} className="text-sky-400 shrink-0" />
                  <span className="truncate">{t('login.liveETAs')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{t('login.encryptedSystem')}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-medium tracking-wider drop-shadow-sm">
              {t('login.systemFooter')}
            </p>
          </div>

          {/* RIGHT SIDE: Wider Floating Frosted Acrylic Login Card (Stays firmly on the Right) */}
          <div className="w-full md:w-[500px] lg:w-[540px] flex items-center justify-center my-auto z-10 py-14 md:py-0 transform-gpu">
            <div 
              dir="ltr" 
              style={{ backdropFilter: 'blur(16px) saturate(145%)', WebkitBackdropFilter: 'blur(16px) saturate(145%)' }}
              className={`w-full max-w-lg rounded-[26px] sm:rounded-[32px] glass-acrylic-card transform-gpu p-5 sm:p-9 relative overflow-hidden shadow-2xl ${locale === 'ur' ? 'lang-ur' : ''}`}
            >
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              
              {/* Header */}
              <div className="flex flex-col items-center mb-5 text-center">
                <SmartQueueLogo size={58} animated={true} className="mb-2" />
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  {t('login.title')}
                </h2>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span>{t('login.encryptedHealthPortal')}</span>
                </div>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="flex items-center gap-2 bg-red-950/70 border border-red-500/30 text-red-200 p-2.5 rounded-2xl text-xs mb-4 font-semibold backdrop-blur-md">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1 px-1 drop-shadow-sm">
                    {t('login.email')}
                  </label>
                  <div className="relative group">
                    <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${
                      locale === 'ur' ? 'right-3.5' : 'left-3.5'
                    }`}>
                      <Mail size={17} />
                    </div>
                    <input
                      type="email"
                      required
                      disabled={loading}
                      autoComplete="off"
                      placeholder={t('login.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full py-3 glass-input rounded-2xl text-sm font-medium ${
                        locale === 'ur' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex justify-between items-center mb-1 px-1">
                    <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider drop-shadow-sm">
                      {t('login.password')}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-amber-300/90 hover:text-amber-200 font-semibold transition-colors drop-shadow-sm"
                    >
                      {t('login.forgotPassword')}
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${
                      locale === 'ur' ? 'right-3.5' : 'left-3.5'
                    }`}>
                      <Lock size={17} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      placeholder={t('login.passwordPlaceholder')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full py-3 glass-input rounded-2xl text-sm font-medium ${
                        locale === 'ur' ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex="-1"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 ${
                        locale === 'ur' ? 'left-2' : 'right-2'
                      }`}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  initial="initial"
                  whileHover="hover"
                  whileTap={{ scale: 0.99 }}
                  className="group w-full py-3 px-4 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 active:scale-[0.99] text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-950/40 border border-amber-300/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 text-sm tracking-wide select-none"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t('login.button')}</span>
                      <motion.span
                        className="inline-flex items-center"
                        variants={{
                          initial: { x: 0 },
                          hover: {
                            x: locale === 'ur' ? [0, -6, 0] : [0, 6, 0],
                            transition: {
                              duration: 0.7,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }
                          }
                        }}
                      >
                        <ArrowRight
                          size={17}
                          className={`transition-transform ${locale === 'ur' ? 'rotate-180' : ''}`}
                        />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Google Sign In */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/35 active:scale-[0.99] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs backdrop-blur-md shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t('login.googleBtn')}</span>
                </button>
              </div>

              {/* Create Account Link */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-300 font-medium">
                  {t('login.noAccount')}{' '}
                  <Link
                    to="/register"
                    className="text-amber-300 font-bold hover:underline hover:text-amber-200 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span>{t('login.registerHere')}</span>
                    <ArrowRight
                      size={13}
                      className={`transition-transform duration-200 ${
                        locale === 'ur' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
                      }`}
                    />
                  </Link>
                </p>
              </div>

              {/* Demo Credentials Quick Fill */}
              <div className="mt-4 pt-3.5 border-t border-white/10">
                <p className="text-[10px] text-slate-400 font-bold tracking-wider text-center uppercase mb-2">
                  {t('login.quickDemoFill')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo('patient')}
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
                  >
                    <UserCheck size={13} className="text-amber-300" />
                    <span>{t('login.patient')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('clinic')}
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
                  >
                    <Building2 size={13} className="text-amber-300" />
                    <span>{t('login.clinic')}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* Splash Transition on Login Authentication */}
      <SplashScreen show={showSplash} onComplete={handleSplashComplete} />
    </div>
  );
};

export default AuthPortal;
