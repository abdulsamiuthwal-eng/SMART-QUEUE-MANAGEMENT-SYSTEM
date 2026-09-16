import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronUp, ChevronDown, Check, Sparkles, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

/**
 * Premium Glass Date & Time Scheduler
 * Allows patients to pick both the Day/Date (Today, Tomorrow, or upcoming days)
 * and the exact Time Slot with quick express doctor slots and digital stepper.
 */
export const GlassTimeScheduler = ({
  value = '',
  onChange,
  selectedDate,
  onDateChange,
  className = '',
}) => {
  const { t, locale } = useLanguage();

  // Generate next 7 upcoming days
  const upcomingDays = React.useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? t('scheduler.today') : i === 1 ? t('scheduler.tomorrow') : d.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short' });
      const dateFormatted = d.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short' });
      days.push({
        iso,
        dayName,
        dateFormatted,
        fullDisplay: `${dayName}, ${dateFormatted}`
      });
    }
    return days;
  }, [locale, t]);

  const todayIso = upcomingDays[0]?.iso || new Date().toISOString().split('T')[0];
  const [internalDate, setInternalDate] = useState(selectedDate || todayIso);

  useEffect(() => {
    if (selectedDate) {
      setInternalDate(selectedDate);
    }
  }, [selectedDate]);

  const handleDaySelect = (dayObj) => {
    setInternalDate(dayObj.iso);
    if (onDateChange) {
      onDateChange(dayObj.iso, dayObj.fullDisplay);
    }
  };

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      setInternalDate(val);
      const d = new Date(val);
      const dayName = d.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short' });
      const dateFormatted = d.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short' });
      if (onDateChange) {
        onDateChange(val, `${dayName}, ${dateFormatted}`);
      }
    }
  };

  // Parse incoming 24-hr "HH:mm" time to 12-hr state
  const parseTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(':')) {
      return { hour12: 10, minute: 0, period: 'AM' };
    }
    const [hStr, mStr] = timeStr.split(':');
    const h24 = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const hour12 = h24 % 12 || 12;
    return { hour12, minute: m, period };
  };

  const initial = parseTime(value);
  const [hour12, setHour12] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState(initial.period);

  useEffect(() => {
    if (value) {
      const parsed = parseTime(value);
      setHour12(parsed.hour12);
      setMinute(parsed.minute);
      setPeriod(parsed.period);
    }
  }, [value]);

  const emitTime = (h12, m, p) => {
    let h24 = h12 % 12;
    if (p === 'PM') h24 += 12;
    const formatted = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (onChange) {
      onChange(formatted);
    }
  };

  const adjustHour = (delta) => {
    let next = hour12 + delta;
    if (next > 12) next = 1;
    if (next < 1) next = 12;
    setHour12(next);
    emitTime(next, minute, period);
  };

  const adjustMinute = (delta) => {
    let next = minute + delta;
    if (next >= 60) next = 0;
    if (next < 0) next = 45;
    next = Math.round(next / 15) * 15;
    if (next >= 60) next = 0;
    setMinute(next);
    emitTime(hour12, next, period);
  };

  const togglePeriod = (newPeriod) => {
    setPeriod(newPeriod);
    emitTime(hour12, minute, newPeriod);
  };

  // Express pre-set slots
  const quickSlots = [
    { label: '09:30 AM', val: '09:30', tag: t('scheduler.morning') },
    { label: '11:00 AM', val: '11:00', tag: t('scheduler.morning') },
    { label: '02:30 PM', val: '14:30', tag: t('scheduler.afternoon') },
    { label: '04:00 PM', val: '16:00', tag: t('scheduler.afternoon') },
    { label: '05:30 PM', val: '17:30', tag: t('scheduler.evening') },
    { label: '07:00 PM', val: '19:00', tag: t('scheduler.evening') },
  ];

  const handleSelectSlot = (slotVal) => {
    const parsed = parseTime(slotVal);
    setHour12(parsed.hour12);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
    if (onChange) onChange(slotVal);
  };

  // Display label for active selected day
  const activeDayObj = upcomingDays.find(d => d.iso === internalDate);
  const activeDateDisplay = activeDayObj 
    ? activeDayObj.fullDisplay 
    : (() => {
        const d = new Date(internalDate);
        return isNaN(d.getTime()) ? internalDate : `${d.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short' })}, ${d.toLocaleDateString(locale === 'ur' ? 'ur-PK' : 'en-US', { day: 'numeric', month: 'short' })}`;
      })();

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* 1. Day / Date Selector */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
            <CalendarDays size={12} className="text-amber-400" />
            <span>{t('scheduler.selectDay')}</span>
          </span>
          <span className="text-[10px] text-amber-300 font-bold font-mono">
            {activeDateDisplay}
          </span>
        </div>

        {/* Day selection chips */}
        <div className="grid grid-cols-4 xs:grid-cols-7 gap-1.5">
          {upcomingDays.map((day) => {
            const isSelected = internalDate === day.iso;
            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => handleDaySelect(day)}
                className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 select-none ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black shadow-[0_4px_14px_rgba(245,158,11,0.4)] ring-2 ring-amber-300'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 hover:text-white'
                }`}
              >
                <span className={`text-[10px] uppercase tracking-wider font-extrabold ${isSelected ? 'text-slate-950' : 'text-amber-300'}`}>
                  {day.dayName}
                </span>
                <span className={`text-[11px] font-bold font-mono ${isSelected ? 'text-slate-950' : 'text-slate-200'}`}>
                  {day.dateFormatted}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Custom Date Picker */}
        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <label htmlFor="custom-appointment-date" className="text-[10px] text-slate-300 font-medium flex items-center gap-1 cursor-pointer">
            <Calendar size={11} className="text-amber-400" />
            <span>{t('scheduler.pickFutureDate')}</span>
          </label>
          <input
            id="custom-appointment-date"
            type="date"
            min={todayIso}
            value={internalDate}
            onChange={handleCustomDateChange}
            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/20 text-white text-[11px] font-bold outline-none focus:border-amber-400 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Digital Clock & Interactive Stepper */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-[#142d3a]/85 border border-white/20 backdrop-blur-xl shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Label / Icon */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">{t('scheduler.scheduledSlot')}</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {activeDateDisplay} • {String(hour12).padStart(2, '0')}:{String(minute).padStart(2, '0')} {period}
              </span>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
            {/* Hours Stepper */}
            <div className="flex flex-col items-center bg-black/25 border border-white/15 rounded-xl p-1">
              <button
                type="button"
                onClick={() => adjustHour(1)}
                className="p-1 hover:bg-white/15 text-slate-300 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                title="Increase Hour"
              >
                <ChevronUp size={14} />
              </button>
              <span className="font-mono text-xs font-black text-white px-1.5 py-0.5">
                {String(hour12).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => adjustHour(-1)}
                className="p-1 hover:bg-white/15 text-slate-300 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                title="Decrease Hour"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <span className="font-black text-white font-mono text-sm">:</span>

            {/* Minutes Stepper */}
            <div className="flex flex-col items-center bg-black/25 border border-white/15 rounded-xl p-1">
              <button
                type="button"
                onClick={() => adjustMinute(15)}
                className="p-1 hover:bg-white/15 text-slate-300 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                title="Increase Minutes (+15m)"
              >
                <ChevronUp size={14} />
              </button>
              <span className="font-mono text-xs font-black text-white px-1.5 py-0.5">
                {String(minute).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => adjustMinute(-15)}
                className="p-1 hover:bg-white/15 text-slate-300 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                title="Decrease Minutes (-15m)"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col bg-black/25 border border-white/15 rounded-xl p-1 gap-1">
              <button
                type="button"
                onClick={() => togglePeriod('AM')}
                className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  period === 'AM'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => togglePeriod('PM')}
                className={`px-2 py-1 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                  period === 'PM'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Express Appointment Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400" />
            <span>{t('scheduler.recommendedSlots')}</span>
          </span>
          <span className="text-[10px] text-amber-300/80 font-mono font-medium">{t('scheduler.quickOneTap')}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {quickSlots.map((slot) => {
            const isSelected = value === slot.val;
            return (
              <button
                key={slot.val}
                type="button"
                onClick={() => handleSelectSlot(slot.val)}
                className={`py-2 px-2 rounded-xl text-center font-bold text-[11px] transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/35 to-orange-500/25 border border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-black'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-mono">{slot.label}</span>
                  {isSelected && <Check size={10} strokeWidth={3} className="text-amber-400" />}
                </div>
                <span className="text-[9px] text-slate-300/80 font-medium tracking-wide">
                  {slot.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
