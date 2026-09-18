import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Sparkles, MessageCircle, AlertTriangle, 
  CheckCircle2, ArrowRight, UserCheck, Package, TrendingUp, HeartHandshake, Shield
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TriageChatbot = ({ 
  mode = 'patient', // 'patient' | 'clinic'
  departments = [],
  liveQueue = {},
  supplies = [],
  reports = {},
  forecast = null,
  clinicName = 'Clinic',
  onSelectDepartment = null 
}) => {
  const { locale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Initial welcome message based on mode
  useEffect(() => {
    if (mode === 'patient') {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: locale === 'ur' 
            ? `السلام علیکم! میں آپ کا AI میڈیکل ٹرائیج اسسٹنٹ ہوں۔ اپنی علامات (Symptoms) بتائیں، میں آپ کو صحیح شعبہ (Department) بتاؤں گا تاکہ آپ کا وقت ضائع نہ ہو۔`
            : `Hello! I am your AI Medical Triage Assistant. Please describe your symptoms (in English or Urdu), and I will guide you to the right department for instant token booking.`
        }
      ]);
    } else {
      setMessages([
        {
          id: 1,
          sender: 'bot',
          text: locale === 'ur'
            ? `خوش آمدید! میں ${clinicName} کا مخصوص AI کلینک مینیجر ہوں۔ مجھ سے لائیو قطار، انتظار کا وقت، کم اسٹاک سامان، یا کل کی پیشگوئی (Forecast) کے بارے میں پوچھیں۔`
            : `Welcome! I am the AI Operations Assistant for ${clinicName}. Ask me anything about live queues, waiting times, low stock items, or tomorrow's patient forecast.`
        }
      ]);
    }
  }, [mode, locale, clinicName]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Quick symptom/query suggestions
  const patientQuickPrompts = [
    { labelEn: "Chest pain & breathing difficulty", labelUr: "سینے میں درد اور سانس کی تکلیف", text: "I have chest pain and shortness of breath" },
    { labelEn: "High fever & body ache", labelUr: "تیز بخار اور جسم میں درد", text: "Severe fever, headache and body pain" },
    { labelEn: "Ear ache & throat infection", labelUr: "کان کا درد اور گلا خراب", text: "Throat pain, cough and ear infection" },
    { labelEn: "Severe joint / bone injury", labelUr: "جوڑوں یا ہڈی میں شدید چوٹ", text: "Bone fracture or severe joint pain" }
  ];

  const clinicQuickPrompts = [
    { labelEn: "Waiting patients count", labelUr: "انتظار کرنے والے مریض", text: "How many patients are waiting in queue right now?" },
    { labelEn: "Emergency triage alerts", labelUr: "ایمرجنسی مریض الرٹ", text: "Are there any emergency or urgent patients waiting in queue?" },
    { labelEn: "Department rush breakdown", labelUr: "ہر شعبے کا رش (Breakdown)", text: "Show waiting breakdown for all departments" },
    { labelEn: "Check low stock supplies", labelUr: "سامان کا کم اسٹاک چیک کریں", text: "Are any medicines or equipment low on stock?" },
    { labelEn: "Today's wait time & served", labelUr: "اوسط وقت اور فارغ مریض", text: "What is today's average wait time and total patients served?" },
    { labelEn: "Tomorrow's patient forecast", labelUr: "کل کا متوقع رش (Forecast)", text: "What is tomorrow's patient load forecast?" }
  ];

  // AI Response Generator
  const handleSend = (userText = null) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    if (!userText) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = generateBotResponse(textToSend.toLowerCase());
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', ...botResponse }]);
    }, 700);
  };

  const generateBotResponse = (query) => {
    if (mode === 'patient') {
      // Patient Triage Logic (English & Roman Urdu matching)
      if (query.includes('chest') || query.includes('heart') || query.includes('breath') || query.includes('seene') || query.includes('dil') || query.includes('chhati') || query.includes('saans')) {
        return {
          text: locale === 'ur'
            ? `⚠️ یہ علامات دل یا کارڈیک نظام سے متعلق ہو سکتی ہیں۔ آپ کو فوراً **کارڈیالوجی (Cardiology)** ڈیپارٹمنٹ جانا چاہیے۔`
            : `⚠️ These symptoms may relate to cardiac function. We strongly recommend visiting the **Cardiology** department.`,
          suggestedDept: 'Cardiology',
          isUrgent: true
        };
      }

      if (query.includes('ear') || query.includes('throat') || query.includes('nose') || query.includes('kaan') || query.includes('gala') || query.includes('naak') || query.includes('sinus')) {
        return {
          text: locale === 'ur'
            ? `یہ علامات ناک، کان یا گلے کی بیماری کی طرف اشارہ کرتی ہیں۔ آپ کو **ای این ٹی (ENT)** شعبے کا ٹوکن لینا چاہیے۔`
            : `Your symptoms correspond to Ear, Nose, and Throat. We recommend booking a token with **ENT** department.`,
          suggestedDept: 'ENT',
          isUrgent: false
        };
      }

      if (query.includes('bone') || query.includes('fracture') || query.includes('joint') || query.includes('haddi') || query.includes('chot') || query.includes('ghutna')) {
        return {
          text: locale === 'ur'
            ? `ہڈی یا جوڑوں کی تکلیف کے لیے **آرتھوپیڈک / جنرل میڈیسن** کا رخ کریں۔`
            : `For joint or bone injuries, we recommend visiting **Orthopedics / General Medicine**.`,
          suggestedDept: 'General Medicine',
          isUrgent: true
        };
      }

      if (query.includes('fever') || query.includes('headache') || query.includes('bukhar') || query.includes('sar dard') || query.includes('vomit') || query.includes('stomach') || query.includes('pet dard') || query.includes('cough') || query.includes('khansi')) {
        return {
          text: locale === 'ur'
            ? `موسمی بیماری، بخار یا عام کمزوری کے لیے **جنرل میڈیسن (General Medicine)** کے ڈاکٹر سے معائنہ کروائیں۔`
            : `For fever, cough, stomach or general illness, please visit **General Medicine**.`,
          suggestedDept: 'General Medicine',
          isUrgent: false
        };
      }

      // Default patient response
      return {
        text: locale === 'ur'
          ? `آپ کی علامات کی بنیاد پر پہلے **جنرل میڈیسن (General Medicine)** میں ڈاکٹر سے بنیادی معائنہ کروانا بہتر ہوگا۔`
          : `Based on your description, a consultation at **General Medicine** is recommended for initial triage.`,
        suggestedDept: 'General Medicine',
        isUrgent: false
      };

    } else {
      // Clinic Ops Assistant Logic (Strict isolation to currently logged in clinic!)
      const allTokens = Object.values(liveQueue || {}).flat();
      const waitingTokens = allTokens.filter(p => p.status === 'waiting');
      const servingTokens = allTokens.filter(p => p.status === 'serving');
      const completedTokens = allTokens.filter(p => p.status === 'completed');
      const emergencyWaiting = waitingTokens.filter(p => p.isEmergency);

      const totalServed = Math.max(Number(reports?.totalServed) || 0, completedTokens.length);
      const totalSkipped = Math.max(Number(reports?.totalSkipped) || 0, allTokens.filter(p => p.status === 'skipped').length);

      let calculatedAvgWait = 0;
      if (completedTokens.length > 0) {
        const totalMins = completedTokens.reduce((acc, t) => {
          const wait = t.completedAt ? Math.round((t.completedAt - t.timestamp) / 60000) : 10;
          return acc + Math.max(1, wait);
        }, 0);
        calculatedAvgWait = Math.round(totalMins / completedTokens.length);
      } else if (reports?.totalServed > 0 && reports?.totalWaitTime > 0) {
        calculatedAvgWait = Math.round(reports.totalWaitTime / reports.totalServed);
      } else if (departments.length > 0) {
        calculatedAvgWait = Math.round(
          departments.reduce((acc, d) => acc + (Number(d.avgTime) || 10), 0) / departments.length
        );
      } else {
        calculatedAvgWait = 10;
      }

      // 1. Emergency cases check
      if (query.includes('emergency') || query.includes('urgent') || query.includes('critical') || query.includes('khatra') || query.includes('shadid')) {
        if (emergencyWaiting.length > 0) {
          const listEn = emergencyWaiting.map(e => `• Token #${e.tokenNumber} (${e.patientName || 'Patient'}) - Dept: ${e.deptName || 'OPD'} [Reason: ${e.urgencyReason || 'Urgent Triage'}]`).join('\n');
          const listUr = emergencyWaiting.map(e => `• ٹوکن #${e.tokenNumber} (${e.patientName || 'مریض'}) - شعبہ: ${e.deptName || 'او پی ڈی'} [وجہ: ${e.urgencyReason || 'فوری معائنہ'}]`).join('\n');
          return {
            text: locale === 'ur'
              ? `🚨 **فوری الرٹ!** اس وقت **${emergencyWaiting.length} ایمرجنسی مریض** انتظار میں ہیں:\n\n${listUr}\n\n⚠️ ان کو فوری طور پر ڈاکٹر کے پاس بھیجا جائے!`
              : `🚨 **Urgent Alert!** There are **${emergencyWaiting.length} Emergency patient(s)** currently waiting in queue:\n\n${listEn}\n\n⚠️ Immediate doctor attention is advised!`,
            isWarning: true
          };
        } else {
          return {
            text: locale === 'ur'
              ? `✅ **معمول کی کارروائی:** اس وقت قطار میں کوئی ایمرجنسی مریض نہیں ہے۔ تمام کاؤنٹرز پر عام مریض دیکھے جا رہے ہیں۔`
              : `✅ **Normal Priority:** There are currently **0 emergency patients** waiting in queue. All counters are operating normally.`
          };
        }
      }

      // 2. Department-wise queue breakdown
      if (query.includes('breakdown') || query.includes('department') || query.includes('shoba') || query.includes('detail') || query.includes('har shoba') || query.includes('dept')) {
        const activeDepts = departments.length > 0 ? departments : Object.keys(liveQueue).map(name => ({ name }));
        const listEn = activeDepts.map(d => {
          const deptTokens = liveQueue[d.name] || [];
          const waiting = deptTokens.filter(p => p.status === 'waiting').length;
          const serving = deptTokens.find(p => p.status === 'serving');
          return `• **${d.name}:** ${waiting} waiting ${serving ? `(Serving Token #${serving.tokenNumber} - ${serving.patientName})` : '(No active counter)'}`;
        }).join('\n');

        const listUr = activeDepts.map(d => {
          const deptTokens = liveQueue[d.name] || [];
          const waiting = deptTokens.filter(p => p.status === 'waiting').length;
          const serving = deptTokens.find(p => p.status === 'serving');
          return `• **${d.name}:** ${waiting} انتظار میں ${serving ? `(حاضر ٹوکن #${serving.tokenNumber} - ${serving.patientName})` : '(کاؤنٹر فارغ)'}`;
        }).join('\n');

        return {
          text: locale === 'ur'
            ? `🏥 **شعبہ جات کی لائیو تفصیل (${clinicName}):**\n\n${listUr}\n\nمجموعی انتظار: **${waitingTokens.length} مریض**`
            : `🏥 **Live Department Breakdown (${clinicName}):**\n\n${listEn}\n\nTotal In-Queue: **${waitingTokens.length} patients**`
        };
      }

      // 3. Performance, wait times, served today
      if (query.includes('wait') || query.includes('intezar') || query.includes('served') || query.includes('completed') || query.includes('performance') || query.includes('karkardagi') || query.includes('aaj ka') || query.includes('time')) {
        return {
          text: locale === 'ur'
            ? `⏱️ **آج کے دن کلینک کی لائیو کارکردگی (${clinicName}):**\n\n• **فارغ کیے گئے مریض (Total Served):** ${totalServed}\n• **مریض کا اوسط انتظار:** ~${calculatedAvgWait} منٹ\n• **اس وقت زیر معائنہ (Serving):** ${servingTokens.length} مریض\n• **غیر حاضر (Skipped):** ${totalSkipped}`
            : `⏱️ **Real-Time Clinic Performance Today (${clinicName}):**\n\n• **Total Patients Served:** ${totalServed}\n• **Average Patient Wait Time:** ~${calculatedAvgWait} mins\n• **Currently Serving Counters:** ${servingTokens.length}\n• **Skipped / No-Shows:** ${totalSkipped}`
        };
      }

      // 4. Low stock supplies & medicines
      if (query.includes('stock') || query.includes('supply') || query.includes('medicine') || query.includes('saman') || query.includes('equipment') || query.includes('dawa') || query.includes('dawai')) {
        const lowItems = supplies.filter(s => s.quantity <= s.threshold);
        if (lowItems.length > 0) {
          const namesUr = lowItems.map(i => `• ${i.name}: باقی **${i.quantity} ${i.unit}** (حد: ${i.threshold} ${i.unit})`).join('\n');
          const namesEn = lowItems.map(i => `• ${i.name}: **${i.quantity} ${i.unit}** remaining (Threshold: ${i.threshold} ${i.unit})`).join('\n');
          return {
            text: locale === 'ur'
              ? `⚠️ **فوری میڈیکل سامان الرٹ!** آپ کے پاس ${lowItems.length} اشیاء کا اسٹاک کم ہے:\n\n${namesUr}\n\nبراۓ مہربانی سپلائی مینیجر کو واٹس ایپ الرٹ بھیجیں تاکہ او پی ڈی بند نہ ہو۔`
              : `⚠️ **Urgent Medical Stock Alert!** ${lowItems.length} item(s) are below safety limits:\n\n${namesEn}\n\nRecommend triggering WhatsApp procurement restock promptly.`,
            isWarning: true
          };
        } else {
          return {
            text: locale === 'ur'
              ? `✅ **زبردست!** آپ کے کلینک کا تمام میڈیکل سامان اور ادویات کا اسٹاک محفوظ حد میں ہے۔`
              : `✅ **Excellent!** All clinical medicines and OPD equipment stock are currently within healthy safety thresholds.`
          };
        }
      }

      // 5. Forecast & Tomorrow's rush
      if (query.includes('forecast') || query.includes('kal') || query.includes('tomorrow') || query.includes('predict') || query.includes('rush') || query.includes('peshgoi') || query.includes('inflow')) {
        const expected = forecast?.totalExpected || Math.max(45, (totalServed + waitingTokens.length) * 2 + 10);
        const peak = forecast?.predictedPeakWindow || '10:30 AM - 01:00 PM';
        const confidence = forecast?.confidenceRate || '94%';
        const busiest = forecast?.deptForecast?.[0]?.name || 'OPD';
        const rec = forecast?.aiRecommendations?.[0] || 'Keep counter staff alert during morning peak window.';

        return {
          text: locale === 'ur'
            ? `📈 **کلینیکل AI پیشگوئی (${forecast?.dateString || 'کل کے لیے'}):**\n\n• **متوقع مریضوں کی آمد:** تقریباً **~${expected} مریض** (${confidence} AI درستگی)\n• **سب سے زیادہ رش کا وقت:** **${peak}**\n• **سب سے مصروف شعبہ:** **${busiest}**\n💡 **AI مشورہ:** ${rec}`
            : `📈 **AI Clinical Load Forecast (${forecast?.dateString || 'Tomorrow'}):**\n\n• **Projected Inflow:** Approximately **~${expected} patients** (${confidence} AI Confidence)\n• **Predicted Peak Window:** **${peak}**\n• **Busiest Department:** **${busiest}**\n💡 **AI Recommendation:** ${rec}`
        };
      }

      // 6. Waiting patients count
      if (query.includes('waiting') || query.includes('patients') || query.includes('mariz') || query.includes('rush') || query.includes('queue') || query.includes('kitne log') || query.includes('kitne mareez')) {
        return {
          text: locale === 'ur'
            ? `📊 اس وقت **${clinicName}** میں کل **${waitingTokens.length} مریض انتظار کر رہے ہیں** اور **${servingTokens.length} مریض معائنہ کروا رہے ہیں**۔${emergencyWaiting.length > 0 ? `\n\n🚨 **توجہ:** ان میں سے **${emergencyWaiting.length} ایمرجنسی مریض** ہیں جنہیں ترجیحی معائنہ چاہیے۔` : ''}`
            : `📊 Currently at **${clinicName}**, there are **${waitingTokens.length} patients waiting** and **${servingTokens.length} patients being served** across all departments.${emergencyWaiting.length > 0 ? `\n\n🚨 **Priority Notice:** **${emergencyWaiting.length} Emergency patient(s)** are waiting for immediate care!` : ''}`
        };
      }

      // Default clinic helper
      return {
        text: locale === 'ur'
          ? `میں آپ کے کلینک (${clinicName}) کا AI آپریشنز اسسٹنٹ ہوں۔ مجھ سے لائیو قطار ('waiting count')، شعبہ جات کی تفصیل ('department breakdown')، ایمرجنسی الرٹس ('emergency cases')، کم سامان ('low stock')، یا کل کی پیشگوئی ('forecast') کے بارے میں پوچھیں۔`
          : `I am your ${clinicName} Operations AI Assistant. You can ask me about 'waiting patients', 'department breakdown', 'emergency alerts', 'average wait time', 'low stock supplies', or 'tomorrow's forecast'.`
      };
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] text-slate-950 font-black shadow-2xl shadow-orange-950/60 border border-amber-300/50 cursor-pointer backdrop-blur-xl group"
      >
        <div className="relative">
          <Bot size={20} className="text-slate-950 transition-transform group-hover:rotate-12" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
        </div>
        <span className="text-[11px] sm:text-xs font-black tracking-wide drop-shadow-sm">
          {mode === 'patient' 
            ? (locale === 'ur' ? 'AI ٹرائیج باٹ' : 'AI Symptom Triage') 
            : (locale === 'ur' ? 'AI کلینک اسسٹنٹ' : 'Clinic AI Ops')}
        </span>
      </motion.button>

      {/* Frosted Acrylic Chatbot Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-16 right-2 left-2 sm:left-auto sm:bottom-24 sm:right-8 z-50 sm:w-[420px] h-[520px] max-h-[82vh] rounded-[28px] sm:rounded-[30px] glass-acrylic-card border border-white/25 bg-[#142834]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden select-none"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/15 bg-white/[0.04] flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#e57342] to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">
                      {mode === 'patient' ? 'Medical Triage AI' : `${clinicName} Ops Assistant`}
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold">
                      Online
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-medium">
                    {mode === 'patient' ? 'Instant Smart OPD Routing' : 'Isolated Clinic Intelligence'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02] flex gap-1.5 overflow-x-auto no-scrollbar">
              {(mode === 'patient' ? patientQuickPrompts : clinicQuickPrompts).map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(item.text)}
                  className="whitespace-nowrap text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 hover:bg-amber-400/20 hover:border-amber-400/40 border border-white/15 text-slate-200 hover:text-amber-200 transition-all cursor-pointer shrink-0"
                >
                  {locale === 'ur' ? item.labelUr : item.labelEn}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#e57342] to-[#ff9655] text-slate-950 font-bold rounded-tr-none'
                        : 'bg-white/15 border border-white/20 text-slate-100 rounded-tl-none backdrop-blur-md'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Department Quick Action for Patient */}
                    {msg.suggestedDept && mode === 'patient' && onSelectDepartment && (
                      <div className="mt-3 pt-2.5 border-t border-white/20">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDepartment(msg.suggestedDept);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 font-black text-[11px] transition-all cursor-pointer shadow-md"
                        >
                          <span>Select {msg.suggestedDept} in Booking Form</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1 font-semibold">
                    {msg.sender === 'user' ? 'You' : 'Smart AI'}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 p-3 bg-white/10 border border-white/15 rounded-2xl w-fit text-xs text-slate-300">
                  <Sparkles size={14} className="text-amber-400 animate-spin" />
                  <span className="text-[11px] font-bold animate-pulse">Analyzing symptoms...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 border-t border-white/15 bg-white/[0.04] flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={locale === 'ur' ? 'اپنی علامات یا سوال یہاں لکھیں...' : 'Describe symptoms or ask question...'}
                className="flex-1 glass-input rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-400 font-medium outline-none focus:border-amber-400 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#e57342] to-[#ff9655] text-slate-950 font-bold shadow-md cursor-pointer transition-all"
              >
                <Send size={15} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TriageChatbot;
