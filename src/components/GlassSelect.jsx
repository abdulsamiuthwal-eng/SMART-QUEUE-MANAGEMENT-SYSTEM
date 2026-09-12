import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium Glassmorphic Dropdown / List View
 * Replaces ugly native OS <select> with a sleek hospital-lounge frosted glass menu.
 */
export const GlassSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  icon: Icon,
  className = '',
  dropdownClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer outline-none select-none text-left
          ${
            isOpen
              ? 'bg-[#183947]/95 border border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-white'
              : 'bg-[#163441]/80 hover:bg-[#1a3d4d]/90 border border-white/20 hover:border-amber-400/50 text-slate-100 shadow-lg'
          } backdrop-blur-xl`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {Icon && (
            <div className={`p-1.5 rounded-xl ${isOpen ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-slate-300'} shrink-0 transition-colors`}>
              <Icon size={15} />
            </div>
          )}
          <div className="flex items-center gap-2 truncate flex-1">
            <span className="truncate text-white font-bold tracking-tight">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.badge && (
              <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {selectedOption.badge}
              </span>
            )}
          </div>
        </div>

        {/* Animated Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0 text-slate-300"
        >
          <ChevronDown size={16} className={isOpen ? 'text-amber-400' : 'text-slate-300'} />
        </motion.div>
      </button>

      {/* Dropdown Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#0f222d]/95 border border-white/25 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] p-1.5 overflow-hidden ${dropdownClassName}`}
            style={{
              maxHeight: '260px',
            }}
          >
            <div className="overflow-y-auto max-h-[248px] space-y-1 pr-1 custom-scrollbar">
              {options.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No options available
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent border border-amber-400/40 text-amber-200 shadow-sm'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate flex-1">
                        {opt.icon && (
                          <span className={`${isSelected ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-300'} shrink-0 transition-colors`}>
                            {opt.icon}
                          </span>
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {opt.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-colors ${
                              isSelected
                                ? 'bg-amber-400/30 text-amber-200 border border-amber-400/40'
                                : 'bg-white/10 text-slate-300 border border-white/10 group-hover:bg-amber-400/20 group-hover:text-amber-300'
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
