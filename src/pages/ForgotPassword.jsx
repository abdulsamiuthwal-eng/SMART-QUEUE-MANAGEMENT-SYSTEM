import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import bgArt from '../assets/queue_lounge_art.webp';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email, newPassword);
      setSuccess(t('forgotPassword.successMsg'));
      setEmail('');
      setNewPassword('');
      setTimeout(() => navigate('/login'), 1300);
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('user-not-found') || err.message === 'auth/user-not-found')) {
        setError(t('forgotPassword.userNotFound'));
      } else {
        setError(err.message || t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen md:h-screen md:overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-slate-950 font-sans select-none overflow-y-auto">
      {/* 4K Atmospheric Artwork Background - Full Translucent View */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${bgArt})` }}
      >
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      {/* Floating Glassy Back to Login Navigation */}
      <div className={`fixed z-50 ${locale === 'ur' ? 'right-3 sm:right-4' : 'left-3 sm:left-4'} top-3 sm:top-4`}>
        <Link
          to="/login"
          className="group inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-acrylic-pill text-[11px] sm:text-xs font-bold text-white transition-all cursor-pointer select-none"
        >
          <ArrowLeft 
            size={13} 
            className={`text-amber-300 transition-transform duration-300 ease-out ${
              locale === 'ur' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'
            }`} 
          />
          <span className="tracking-wide drop-shadow-sm">{t('forgotPassword.backToLogin')}</span>
        </Link>
      </div>

      <div className="w-full max-w-md z-10 my-auto py-10 sm:py-4">
        {/* Translucent Frosted Glass Card */}
        <div dir="ltr" className={`w-full glass-acrylic-card rounded-[26px] sm:rounded-[32px] p-5 sm:p-8 relative overflow-hidden ${locale === 'ur' ? 'lang-ur' : ''}`}>
          {/* Subtle frosted glass specular highlight */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center mb-5 text-center">
            <SmartQueueLogo size={48} animated={true} className="mb-2" />
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {t('forgotPassword.title')}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-[10px] font-bold text-amber-300">
              <KeyRound size={11} className="text-amber-400" />
              <span>{t('forgotPassword.badge')}</span>
            </div>
            <p className="text-xs text-slate-200/95 leading-relaxed font-medium text-center mt-3">
              {t('forgotPassword.instructions')}
            </p>
          </div>

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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 p-2.5 rounded-2xl text-xs mb-4 font-semibold backdrop-blur-md"
            >
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1 px-1 drop-shadow-sm">
                {t('forgotPassword.email')}
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
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-3 glass-input rounded-2xl text-sm font-medium ${
                    locale === 'ur' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'
                  }`}
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-1 px-1 drop-shadow-sm">
                {t('forgotPassword.newPassword')}
              </label>
              <div className="relative group">
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${
                  locale === 'ur' ? 'right-3.5' : 'left-3.5'
                }`}>
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  placeholder={t('forgotPassword.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <motion.button
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 py-3 mt-4 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-950/40 border border-amber-300/40 transition-all cursor-pointer text-sm tracking-wide"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={17} />
                  <span>{t('forgotPassword.sendBtn')}</span>
                  <ArrowRight 
                    size={16} 
                    className={`transition-transform duration-300 ease-out ${
                      locale === 'ur' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                    }`} 
                  />
                </>
              )}
            </motion.button>
          </form>

          {/* Back to Login Pill with Arrow animation */}
          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full glass-acrylic-pill text-xs font-bold text-amber-300 hover:text-amber-200 transition-all cursor-pointer shadow-md"
            >
              <ArrowLeft 
                size={14} 
                className={`transition-transform duration-300 ease-out ${
                  locale === 'ur' ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'
                }`} 
              />
              <span>{t('forgotPassword.backToLogin')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
