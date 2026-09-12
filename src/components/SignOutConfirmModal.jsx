import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ShieldAlert, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SignOutConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const { t, locale } = useLanguage();
  const [loading, setLoading] = useState(false);
  const isUrdu = locale === 'ur';

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Frosted dark backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={loading ? undefined : onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            dir={isUrdu ? 'rtl' : 'ltr'}
            style={{ backdropFilter: 'blur(20px) saturate(160%)', WebkitBackdropFilter: 'blur(20px) saturate(160%)' }}
            className="relative w-full max-w-md glass-acrylic-card rounded-3xl p-6 sm:p-7 border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(244,63,94,0.12)] overflow-hidden z-10"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Close (X) button */}
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer`}
              aria-label="Close modal"
            >
              <X size={15} />
            </button>

            {/* Icon & Badge */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/25 to-red-600/30 border border-rose-400/40 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.35)]">
                  <LogOut size={28} className={isUrdu ? 'rotate-180' : ''} />
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 backdrop-blur-sm">
                  <ShieldAlert size={12} />
                </div>
              </div>

              {/* Security Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-[10px] font-extrabold uppercase tracking-wider text-rose-300 mb-3">
                <span>{t('signOutModal.badge')}</span>
              </div>

              {/* Title & Message */}
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                {t('signOutModal.title')}
              </h3>
              
              <p className="text-sm font-semibold text-slate-200 leading-relaxed mb-2">
                {t('signOutModal.message')}
              </p>

              <p className="text-xs text-slate-300/80 leading-relaxed max-w-sm mb-6">
                {t('signOutModal.submessage')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
              {/* Cancel Button */}
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-slate-200 hover:text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <span>{t('signOutModal.cancel')}</span>
              </button>

              {/* Confirm Sign Out Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <LogOut size={15} className={isUrdu ? 'rotate-180' : ''} />
                    <span>{t('signOutModal.confirm')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignOutConfirmModal;
