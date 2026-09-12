import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Building, 
  Building2,
  MapPin, 
  ArrowLeft, 
  ArrowRight,
  UserPlus,
  ShieldCheck,
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import bgArt from '../assets/queue_lounge_art.webp';

export const Register = () => {
  const { register } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'org'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State - Patient
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientPassword, setPatientPassword] = useState('');

  // Form State - Org
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgPassword, setOrgPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'patient') {
        await register({
          email: patientEmail,
          password: patientPassword,
          role: 'patient',
          name: patientName,
          phone: patientPhone
        });
        setSuccess(t('register.successPatient'));
        setTimeout(() => navigate('/login'), 1200);
      } else {
        await register({
          email: orgEmail,
          password: orgPassword,
          role: 'org',
          name: orgName,
          phone: orgPhone,
          address: orgAddress
        });
        setSuccess(t('register.successOrg'));
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('email-already-in-use') || err.message === 'auth/email-already-in-use')) {
        setError(t('register.emailInUse'));
      } else {
        setError(err.message || t('common.error'));
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen md:h-screen md:overflow-hidden flex items-center justify-center p-3 sm:p-5 bg-slate-950 font-sans select-none overflow-y-auto">
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
          <span className="tracking-wide drop-shadow-sm">{t('register.backToLogin')}</span>
        </Link>
      </div>

      <div className="w-full max-w-md lg:max-w-lg z-10 my-auto py-10 sm:py-4">
        {/* Translucent Frosted Glass Card */}
        <div dir="ltr" className={`w-full glass-acrylic-card rounded-[26px] sm:rounded-[30px] p-4 sm:p-7 relative overflow-hidden ${locale === 'ur' ? 'lang-ur' : ''}`}>
          {/* Subtle frosted glass specular highlight */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center mb-4 text-center">
            <SmartQueueLogo size={48} animated={true} className="mb-1.5" />
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
              {t('register.title')}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
              <ShieldCheck size={11} className="text-emerald-400" />
              <span>{t('register.badge')}</span>
            </div>
          </div>

          {/* Role Tab Selector (Frosted Acrylic Switcher) */}
          <div className="relative flex p-1 bg-white/10 border border-white/20 rounded-2xl mb-4 backdrop-blur-md">
            <button
              type="button"
              onClick={() => { setActiveTab('patient'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                activeTab === 'patient' ? 'text-slate-950' : 'text-slate-200 hover:text-white'
              }`}
            >
              {activeTab === 'patient' && (
                <motion.div
                  layoutId="active-register-tab"
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl z-0 shadow-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <User size={13} />
                {t('register.patientTab')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('org'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all duration-300 relative z-10 cursor-pointer ${
                activeTab === 'org' ? 'text-slate-950' : 'text-slate-200 hover:text-white'
              }`}
            >
              {activeTab === 'org' && (
                <motion.div
                  layoutId="active-register-tab"
                  className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl z-0 shadow-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Building2 size={13} />
                {t('register.orgTab')}
              </span>
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-950/70 border border-red-500/30 text-red-200 p-2.5 rounded-2xl text-xs mb-3 font-semibold backdrop-blur-md"
            >
              <AlertCircle size={15} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 p-2.5 rounded-2xl text-xs mb-3 font-semibold backdrop-blur-md"
            >
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3">
            <AnimatePresence mode="wait">
              {activeTab === 'patient' ? (
                <motion.div
                  key="patient-fields"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2.5"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                      {t('register.fullName')}
                    </label>
                    <div className="relative group">
                      <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                        <User size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        autoComplete="off"
                        placeholder={t('register.fullNamePlaceholder')}
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                          locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                        {t('register.email')}
                      </label>
                      <div className="relative group">
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          required
                          disabled={loading}
                          autoComplete="off"
                          placeholder={t('register.emailPlaceholder')}
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                            locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                        {t('register.phone')}
                      </label>
                      <div className="relative group">
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          required
                          disabled={loading}
                          autoComplete="off"
                          placeholder={t('register.phonePlaceholder')}
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                            locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                      {t('register.password')}
                    </label>
                    <div className="relative group">
                      <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        required
                        disabled={loading}
                        autoComplete="new-password"
                        placeholder={t('register.passwordPlaceholder')}
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                          locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="org-fields"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-2.5"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                      {t('register.hospitalName')}
                    </label>
                    <div className="relative group">
                      <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        autoComplete="off"
                        placeholder={t('register.hospitalNamePlaceholder')}
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                          locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                        {t('register.email')}
                      </label>
                      <div className="relative group">
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          required
                          disabled={loading}
                          autoComplete="off"
                          placeholder={t('register.emailPlaceholder')}
                          value={orgEmail}
                          onChange={(e) => setOrgEmail(e.target.value)}
                          className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                            locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                        {t('register.phone')}
                      </label>
                      <div className="relative group">
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          required
                          disabled={loading}
                          autoComplete="off"
                          placeholder={t('register.phonePlaceholder')}
                          value={orgPhone}
                          onChange={(e) => setOrgPhone(e.target.value)}
                          className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                            locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                        {t('register.address')}
                      </label>
                      <div className="relative group">
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                          <MapPin size={16} />
                        </div>
                        <input
                          type="text"
                          required
                          disabled={loading}
                          autoComplete="off"
                          placeholder={t('register.addressPlaceholder')}
                          value={orgAddress}
                          onChange={(e) => setOrgAddress(e.target.value)}
                          className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                            locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wider mb-0.5 px-1 drop-shadow-sm">
                        {t('register.password')}
                      </label>
                      <div className="relative group">
                        <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors duration-200 z-10 ${locale === 'ur' ? 'right-3.5' : 'left-3.5'}`}>
                          <Lock size={16} />
                        </div>
                        <input
                          type="password"
                          required
                          disabled={loading}
                          autoComplete="new-password"
                          placeholder={t('register.passwordPlaceholder')}
                          value={orgPassword}
                          onChange={(e) => setOrgPassword(e.target.value)}
                          className={`w-full py-2.5 glass-input rounded-2xl text-xs font-medium ${
                            locale === 'ur' ? 'pr-10 pl-3.5 text-right' : 'pl-10 pr-3.5 text-left'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Warm Amber Register Button with Animated UserPlus Icon */}
            <motion.button
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 py-2.5 mt-3 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-orange-950/40 border border-amber-300/40 transition-all cursor-pointer text-sm tracking-wide"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('register.registerBtn')}</span>
                  <UserPlus 
                    size={16} 
                    className={`transition-transform duration-300 ease-out ${
                      locale === 'ur' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                    }`} 
                  />
                </>
              )}
            </motion.button>
          </form>

          {/* Already have an account link with Animated Arrow */}
          <div className="mt-3 text-center text-xs text-slate-200 font-medium">
            <span>{t('register.alreadyHaveAccount')}{' '}</span>
            <Link 
              to="/login" 
              className="group inline-flex items-center gap-1 text-amber-300 font-bold hover:underline hover:text-amber-200 transition-colors"
            >
              <span>{t('register.loginHere')}</span>
              <ArrowRight 
                size={12} 
                className={`transition-transform duration-300 ${
                  locale === 'ur' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'
                }`} 
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
