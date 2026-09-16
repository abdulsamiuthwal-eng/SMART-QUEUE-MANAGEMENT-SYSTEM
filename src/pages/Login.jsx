import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SplashScreen } from '../components/SplashScreen';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight,
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock, 
  UserCheck, 
  Building2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import bgArt from '../assets/queue_lounge_art.jpg';

export const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [destPath, setDestPath] = useState('');

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

  const fillDemo = async (role) => {
    setError('');
    const demoEmail = role === 'patient' ? 'patient@demo.com' : 'clinic@demo.com';
    const demoPassword = 'demo123';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      handleLoginSuccess(user);
    } catch (err) {
      console.error("Demo login error:", err);
      setError(t('auth.invalidCreds'));
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen md:h-screen md:overflow-hidden w-full flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 lg:p-10 bg-slate-950 font-sans select-none overflow-y-auto">
      {/* 4K Atmospheric Queue Lounge Artwork Background - Seamless Spanning */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgArt})` }}
      >
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* LEFT SIDE: Expanded Scenic Branding & Atmospheric Info (Desktop View) */}
      <motion.div 
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex flex-1 flex-col justify-between self-stretch py-6 pl-4 pr-8 z-10 max-w-2xl"
      >
        {/* Top Branding Badge with Premium Vector Logo */}
        <div className="flex items-center gap-3.5 pt-2">
          <SmartQueueLogo size={52} animated={true} />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              {t('common.appName')}
            </h1>
            <p className="text-[11px] text-amber-300/90 font-bold tracking-widest uppercase flex items-center gap-1.5">
              <span>Smart Healthcare Flow</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </p>
          </div>
        </div>

        {/* Ambient Info Card with true translucent crystalline glass */}
        <div 
          style={{ backdropFilter: 'blur(16px) saturate(145%)', WebkitBackdropFilter: 'blur(16px) saturate(145%)' }}
          className="w-full max-w-xl space-y-3.5 p-6 lg:p-7 rounded-[30px] glass-acrylic-card relative overflow-hidden"
        >
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/35 text-[11px] font-bold text-amber-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {locale === 'en' ? 'Real-Time Queue Management' : 'لائیو قطار مینیجمنٹ'}
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-white leading-snug drop-shadow-md">
            {locale === 'en' ? 'Calm & Intelligent Patient Routing' : 'پرسکون اور منظم طبی سہولیات'}
          </h2>

          <p className="text-xs text-slate-200/95 leading-relaxed font-medium">
            {locale === 'en'
              ? 'Minimize waiting stress with real-time digital token calling, estimated times, and live department tracking.'
              : 'لائیو ٹوکن ٹریکنگ اور انتظار کے متوقع وقت کے ساتھ طبی معائنے کو آسان اور پرسکون بنائیں۔'}
          </p>

          {/* Quick Feature Badges with Premium Icons */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200">
              <Zap size={14} className="text-amber-400 shrink-0" />
              <span className="truncate">{locale === 'en' ? 'Instant Tokens' : 'فوری ٹوکن'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200">
              <Clock size={14} className="text-sky-400 shrink-0" />
              <span className="truncate">{locale === 'en' ? 'Live ETAs' : 'لائیو وقت'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span className="truncate">{locale === 'en' ? 'Encrypted' : 'محفوظ نظام'}</span>
            </div>
          </div>
        </div>

        {/* Bottom subtle brand tag */}
        <p className="text-[10px] text-slate-400 font-medium tracking-wider drop-shadow-sm">
          {locale === 'en' ? 'Smart Queue Management System' : 'اسمارٹ قطار مینیجمنٹ سسٹم'}
        </p>
      </motion.div>

      {/* RIGHT SIDE: Wider Floating Frosted Acrylic Glass Card - Slides smoothly in from the RIGHT */}
      <motion.div 
        initial={{ x: 260, opacity: 0, scale: 0.96 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-[500px] lg:w-[540px] flex items-center justify-center my-auto z-10 py-4 md:py-0"
      >
        <div 
          style={{ backdropFilter: 'blur(16px) saturate(145%)', WebkitBackdropFilter: 'blur(16px) saturate(145%)' }}
          className="w-full max-w-lg rounded-[32px] glass-acrylic-card p-7 sm:p-9 relative overflow-hidden"
        >
          {/* Subtle frosted glass specular highlight arc */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          {/* Header with New Smart Queue Vector Logo */}
          <div className="flex flex-col items-center mb-5 text-center">
            <SmartQueueLogo size={58} animated={true} className="mb-2" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {t('auth.login')}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>{locale === 'en' ? 'Encrypted Health Portal' : 'محفوظ طبی پورٹل'}</span>
            </div>
          </div>

          {/* Error Alert Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-950/70 border border-red-500/30 text-red-200 p-2.5 rounded-2xl text-xs mb-4 font-semibold backdrop-blur-md"
            >
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1 px-1 drop-shadow-sm">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 border border-white/20 text-amber-300/80 group-focus-within:text-amber-300 group-focus-within:border-amber-400/60 group-focus-within:bg-amber-400/20 transition-all pointer-events-none ${
                  locale === 'ur' ? 'right-2.5' : 'left-2.5'
                }`}>
                  <Mail size={14} />
                </div>
                <input
                  type="email"
                  required
                  disabled={loading}
                  autoComplete="off"
                  placeholder={locale === 'en' ? 'Enter email address' : 'اپنا ای میل درج کریں'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-3 glass-input rounded-2xl text-sm font-medium ${
                    locale === 'ur' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                  }`}
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div>
              <div className="flex justify-between items-center mb-1 px-1">
                <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider drop-shadow-sm">
                  {t('auth.password')}
                </label>
                <Link
                  to="/forgot-password"
                  className="group inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                >
                  <span>{t('auth.forgotPassword')}</span>
                  <ArrowRight size={11} className={`transition-transform duration-300 ${locale === 'ur' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </Link>
              </div>
              <div className="relative group">
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 border border-white/20 text-amber-300/80 group-focus-within:text-amber-300 group-focus-within:border-amber-400/60 group-focus-within:bg-amber-400/20 transition-all pointer-events-none ${
                  locale === 'ur' ? 'right-2.5' : 'left-2.5'
                }`}>
                  <Lock size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder={locale === 'en' ? 'Enter password' : 'اپنا پاس ورڈ درج کریں'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-3 glass-input rounded-2xl text-sm font-medium ${
                    locale === 'ur' ? 'pr-11 pl-11 text-right' : 'pl-11 pr-11 text-left'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 ${
                    locale === 'ur' ? 'left-2' : 'right-2'
                  }`}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Glowing Warm Amber Login Button with Animated Arrow */}
            <motion.button
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 py-2.5 sm:py-3 mt-4 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-950/40 border border-amber-300/40 transition-all cursor-pointer text-sm tracking-wide"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.login')}</span>
                  <LogIn 
                    size={16} 
                    className={`transition-transform duration-300 ease-out ${
                      locale === 'ur' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                    }`} 
                  />
                </>
              )}
            </motion.button>
          </form>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <span className="relative px-3 bg-slate-950/70 text-[10px] text-slate-300 uppercase tracking-widest font-extrabold backdrop-blur-md rounded-full border border-white/10">
              {locale === 'en' ? 'OR' : 'یا'}
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl transition-all cursor-pointer text-xs font-bold shadow-lg backdrop-blur-xl"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>{t('auth.googleBtn')}</span>
          </button>

          {/* Register Link with Animated Arrow */}
          <div className="mt-3.5 text-center text-xs text-slate-200 font-medium">
            <span>{t('auth.dontHaveAccount')}{' '}</span>
            <Link 
              to="/register" 
              className="group inline-flex items-center gap-1 text-amber-300 font-bold hover:underline hover:text-amber-200 transition-colors"
            >
              <span>{t('auth.registerHere')}</span>
              <ArrowRight 
                size={12} 
                className={`transition-transform duration-300 ${
                  locale === 'ur' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                }`} 
              />
            </Link>
          </div>
          
          {/* Quick Demo Fill Buttons (Frosted Glass Container with Premium Badges) */}
          <div className="mt-3.5 p-2.5 bg-white/10 border border-white/15 rounded-2xl backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                {locale === 'en' ? 'Quick Demo Login' : 'ڈیمو لاگ ان (فوری)'}
              </span>
              <span className="text-[9px] text-slate-300/80 font-semibold">1-Click Auto Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('patient')}
                className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
              >
                <UserCheck size={13} className="text-amber-300" />
                <span>{locale === 'en' ? 'Patient' : 'مریض'}</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('clinic')}
                className="py-1.5 px-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-400/50 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 backdrop-blur-md"
              >
                <Building2 size={13} className="text-amber-300" />
                <span>{locale === 'en' ? 'Hospital' : 'ہسپتال'}</span>
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Splash Transition */}
      <SplashScreen show={showSplash} onComplete={handleSplashComplete} />
    </div>
  );
};

export default Login;
