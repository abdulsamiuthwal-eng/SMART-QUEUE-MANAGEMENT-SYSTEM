import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { queueService } from '../firebase/queueService';
import { 
  LogOut, Calendar, Clock, Ticket, RefreshCw, Star, 
  Bell, CheckCircle2, MessageSquare, AlertCircle, X, User, Languages,
  QrCode, MessageCircle, Send, AlertTriangle, ShieldAlert, Sparkles, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { TriageChatbot } from '../components/TriageChatbot';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import dashboardLoungeArt from '../assets/dashboard_lounge.webp';

export const PatientDashboard = () => {
  useSmoothScroll();
  const { currentUser, logout } = useAuth();
  const { t, locale, toggleLanguage } = useLanguage();

  // Clinics & Booking States
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [bookingType, setBookingType] = useState('walk-in'); // 'walk-in' | 'appointment'
  const [prefTime, setPrefTime] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  
  // Live Queue States
  const [liveQueue, setLiveQueue] = useState({});
  const [activeToken, setActiveToken] = useState(null);
  
  // Feedback & Notification States
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newPrefTime, setNewPrefTime] = useState('');

  // QR Code Pass Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // WhatsApp Alert State
  const [whatsappPhone, setWhatsappPhone] = useState(() => localStorage.getItem('smart_queue_patient_wa') || '');
  const [whatsappSent, setWhatsappSent] = useState(false);

  // Page Loading state for Shimmer Glass Skeleton
  const [pageLoading, setPageLoading] = useState(true);

  // 1. Fetch available clinics on load
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const list = await queueService.getOrganizations();
        setClinics(list);
        if (list.length > 0) {
          setSelectedClinic(list[0].uid);
        }
      } catch (err) {
        console.error("Error fetching clinics:", err);
      } finally {
        setTimeout(() => setPageLoading(false), 650);
      }
    };
    fetchClinics();
    
    setNotifications([
      { id: 1, text: 'Welcome to Smart Queue! Keep this window open for live updates.', time: 'Just now' }
    ]);
  }, []);

  // 2. Fetch departments and listen to live queues when selectedClinic changes
  useEffect(() => {
    if (!selectedClinic) return;

    const unsubscribeDepts = queueService.getDepartments(selectedClinic, (data) => {
      setDepartments(data);
      if (data.length > 0) {
        setSelectedDept(prev => prev || data[0].name);
      } else {
        setSelectedDept('');
      }
    });

    const unsubscribeQueue = queueService.getLiveQueue(selectedClinic, (queueData) => {
      setLiveQueue(queueData);
    });

    return () => {
      unsubscribeDepts();
      unsubscribeQueue();
    };
  }, [selectedClinic]);

  // 3. Scan live queue for the patient's active token
  useEffect(() => {
    if (!selectedClinic || !currentUser) return;
    
    let foundToken = null;
    let foundDept = '';

    Object.keys(liveQueue).forEach(deptName => {
      const tokens = liveQueue[deptName] || [];
      const userToken = tokens.find(t => t.patientId === currentUser.uid && t.status !== 'completed' && t.status !== 'skipped');
      if (userToken) {
        foundToken = userToken;
        foundDept = deptName;
      }
    });

    if (foundToken) {
      setActiveToken({ ...foundToken, deptName: foundDept });
    } else {
      setActiveToken(null);
    }
  }, [liveQueue, selectedClinic, currentUser]);

  // Generate QR Code data URL when active token is found
  useEffect(() => {
    if (activeToken && selectedClinic) {
      const payload = JSON.stringify({
        tokenId: activeToken.tokenId,
        tokenNumber: activeToken.tokenNumber,
        deptName: activeToken.deptName,
        clinicId: selectedClinic,
        patientName: activeToken.patientName,
        isEmergency: activeToken.isEmergency || false
      });

      QRCode.toDataURL(payload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#0a101d',
          light: '#ffffff'
        }
      }).then(url => {
        setQrDataUrl(url);
      }).catch(err => {
        console.error("QR Code Error:", err);
      });
    }
  }, [activeToken, selectedClinic]);

  const triggerAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
  };

  const addNotification = (text) => {
    const newNotif = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // 4. Booking Token Action
  const handleBookToken = async (e) => {
    e.preventDefault();
    if (!selectedClinic || !selectedDept || !currentUser) return;

    try {
      const booked = await queueService.bookToken(
        selectedClinic,
        selectedDept,
        currentUser.uid,
        currentUser.name || 'Patient',
        currentUser.phone || 'N/A',
        bookingType,
        bookingType === 'appointment' ? prefTime : '',
        isEmergency,
        isEmergency ? 'Critical / Urgent Medical Attention' : ''
      );

      triggerAlert('success', `${isEmergency ? '🚨 Emergency Triage Priority Issued' : t('patient.bookedSuccess')} (Token #${booked.tokenNumber})`);
      addNotification(`Token #${booked.tokenNumber} booked for ${selectedDept} ${isEmergency ? '(🚨 EMERGENCY PRIORITY)' : ''}`);
      setPrefTime('');
      setIsEmergency(false);
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 5. Reschedule Action
  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!activeToken || !newPrefTime) return;

    try {
      await queueService.rescheduleToken(
        selectedClinic,
        activeToken.deptName,
        activeToken.tokenId,
        newPrefTime
      );

      triggerAlert('success', t('patient.rescheduleSuccess'));
      addNotification(`Appointment rescheduled to ${newPrefTime}.`);
      setRescheduleModalOpen(false);
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 6. Cancel Action
  const handleCancelToken = async () => {
    if (!activeToken) return;
    if (!window.confirm("Are you sure you want to cancel this token?")) return;

    try {
      await queueService.cancelToken(
        selectedClinic,
        activeToken.deptName,
        activeToken.tokenId
      );

      triggerAlert('success', t('patient.cancelSuccess'));
      addNotification(`Token #${activeToken.tokenNumber} was cancelled.`);
      setActiveToken(null);
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 7. Feedback Submit
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClinic || !currentUser) return;

    try {
      await queueService.submitFeedback(selectedClinic, {
        patientId: currentUser.uid,
        patientName: currentUser.name || 'Patient',
        rating,
        comments: feedbackText
      });

      setFeedbackSuccess(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // 8. WhatsApp Queue Alert Action
  const handleSendWhatsAppStatus = () => {
    if (!whatsappPhone.trim()) {
      triggerAlert('error', 'Please enter your WhatsApp number (e.g. 0300-1234567).');
      return;
    }
    localStorage.setItem('smart_queue_patient_wa', whatsappPhone);

    const msg = `🏥 *Smart Queue Management System - Live Status*\n\n` +
      `Hello ${currentUser?.name || 'Patient'},\n` +
      `*Facility:* ${selectedClinicName}\n` +
      `*Department:* ${activeToken.deptName}\n` +
      `*Your Token:* #${activeToken.tokenNumber} ${activeToken.isEmergency ? '🚨 (EMERGENCY PRIORITY)' : ''}\n` +
      `*Currently Serving:* #${serving}\n` +
      `*Your Position in Line:* ${position}\n` +
      `*Estimated Wait Time:* ${waitTime} mins\n\n` +
      `_Please proceed to the OPD counter when 2 patients remain._\n` +
      `Stay safe!`;

    const url = queueService.generateWhatsAppUrl(whatsappPhone, msg);
    window.open(url, '_blank');
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 4000);
  };

  const getPositionDetails = () => {
    if (!activeToken || !liveQueue[activeToken.deptName]) return { serving: '-', position: '-', waitTime: '-' };

    const deptQueue = liveQueue[activeToken.deptName] || [];
    const servingTokenObj = deptQueue.find(t => t.status === 'serving');
    const servingNum = servingTokenObj ? servingTokenObj.tokenNumber : '-';

    // Emergency tokens jump to top
    const waitingList = deptQueue.filter(t => t.status === 'waiting').sort((a, b) => {
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return a.timestamp - b.timestamp;
    });
    
    const userIndex = waitingList.findIndex(t => t.tokenId === activeToken.tokenId);
    const position = userIndex !== -1 ? userIndex + 1 : (activeToken.status === 'serving' ? 0 : '-');

    const deptInfo = departments.find(d => d.name === activeToken.deptName);
    const avgTime = deptInfo ? deptInfo.avgTime : 10;
    const waitTime = userIndex !== -1 ? (activeToken.isEmergency ? 0 : userIndex * avgTime) : (activeToken.status === 'serving' ? 0 : '-');

    return {
      serving: servingNum,
      position: position,
      waitTime: waitTime
    };
  };

  const { serving, position, waitTime } = getPositionDetails();
  const selectedClinicName = clinics.find(c => c.uid === selectedClinic)?.hospitalName || 'Clinic';

  // Card Fade Scroll Animation Configuration
  const fadeScrollVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        delay: i * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };

  return (
    <div dir="ltr" className={`min-h-screen bg-[#11242d] text-slate-100 pb-16 relative overflow-x-clip select-none ${locale === 'ur' ? 'lang-ur' : 'font-sans'}`}>
      {/* 1. ATMOSPHERIC BACKGROUND WITH CLINIC LOUNGE ART */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none"
        style={{ backgroundImage: `url(${dashboardLoungeArt})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#132732]/78 via-[#18313e]/68 to-[#10212a]/82" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#142934]/25 to-[#0b171d]/60" />
      </div>

      {/* 2. HARDWARE-ACCELERATED AMBIENT GLOW (Zero blur overhead for 120fps buttery scrolling) */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(circle 550px at 85% 15%, rgba(245, 158, 11, 0.12) 0%, transparent 70%),
            radial-gradient(circle 600px at 25% 8%, rgba(14, 165, 233, 0.10) 0%, transparent 70%),
            radial-gradient(circle 650px at 10% 85%, rgba(20, 184, 166, 0.10) 0%, transparent 70%)
          `,
          transform: 'translateZ(0)',
          contain: 'strict'
        }}
      />

      {/* Header Dashboard Nav - Locked Firmly Left-to-Right */}
      <nav className="sticky top-0 z-40 border-b border-white/20 bg-[#162d3a]/70 backdrop-blur-2xl px-4 sm:px-8 py-3.5 flex justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <SmartQueueLogo size={42} animated={true} />
          <div>
            <h1 className="text-lg font-black tracking-tight text-white drop-shadow-sm">{t('patient.dashboard')}</h1>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-[9px] font-bold text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('welcome.liveTokens')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-sm"
          >
            <Languages size={14} />
            <span>{locale === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-sm">
            <User size={13} className="text-amber-400" />
            <span className="text-xs font-bold text-slate-100">
              {currentUser?.name || currentUser?.email}
            </span>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/20 border border-rose-400/35 rounded-full text-xs font-bold text-rose-200 hover:bg-rose-500/30 cursor-pointer transition-all shadow-sm"
          >
            <LogOut size={13} />
            <span>{t('common.logout')}</span>
          </motion.button>
        </div>
      </nav>

      {/* Alert toast notifier */}
      <AnimatePresence>
        {alertMsg.text && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-xl ${
              alertMsg.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40' 
                : 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-rose-950/40'
            }`}
          >
            {alertMsg.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertCircle size={16} className="text-rose-400 shrink-0" />}
            <span>{alertMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        {pageLoading ? (
          /* SHIMMER GLASS SKELETON LOADER */
          <div className="space-y-8 animate-fade-in pointer-events-none">
            <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-2xl">
              <div className="space-y-2.5 w-full max-w-md">
                <div className="h-8 w-64 glass-skeleton" />
                <div className="h-4 w-80 glass-skeleton" />
              </div>
              <div className="h-10 w-64 glass-skeleton rounded-2xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-36 glass-skeleton" />
                    <div className="h-6 w-28 glass-skeleton rounded-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-56 glass-skeleton rounded-[28px]" />
                    <div className="space-y-4">
                      <div className="h-16 glass-skeleton rounded-2xl" />
                      <div className="h-16 glass-skeleton rounded-2xl" />
                      <div className="h-16 glass-skeleton rounded-2xl" />
                    </div>
                  </div>
                </div>

                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-5 shadow-2xl">
                  <div className="h-6 w-48 glass-skeleton" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-20 glass-skeleton rounded-2xl" />
                    <div className="h-20 glass-skeleton rounded-2xl" />
                    <div className="h-20 glass-skeleton rounded-2xl" />
                    <div className="h-20 glass-skeleton rounded-2xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-4 shadow-2xl">
                  <div className="h-6 w-36 glass-skeleton" />
                  <div className="h-10 glass-skeleton rounded-2xl" />
                  <div className="h-10 glass-skeleton rounded-2xl" />
                  <div className="h-12 glass-skeleton rounded-2xl mt-4" />
                </div>

                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-4 shadow-2xl">
                  <div className="h-6 w-32 glass-skeleton" />
                  <div className="h-14 glass-skeleton rounded-2xl" />
                  <div className="h-14 glass-skeleton rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ACTUAL DASHBOARD WITH SCROLL FADE ANIMATIONS */
          <div className="space-y-8">
            {/* Card 0: Welcome Section & Clinic Picker */}
            <motion.div 
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeScrollVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-2xl"
            >
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/25 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                  {t('patient.welcome')} <span className="text-amber-400">{currentUser?.name || 'Friend'}!</span>
                </h2>
                <p className="text-xs text-slate-200 font-medium mt-1">
                  Select your healthcare facility to join the live queue, check status, or get WhatsApp alerts.
                </p>
              </div>
              <div className="w-full md:w-auto relative z-10">
                <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                  Select Hospital / Clinic
                </label>
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className="w-full md:w-72 glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 transition-all cursor-pointer font-bold shadow-lg"
                >
                  {clinics.map(clinic => (
                    <option key={clinic.uid} value={clinic.uid} className="bg-slate-900 text-white">
                      {clinic.hospitalName}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Column 1 & 2: Active Token & Live Status */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Card 1: Live Queue widget */}
                <motion.div 
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-lg font-black flex items-center gap-2 text-white drop-shadow-sm">
                      <Clock size={19} className="text-amber-400" />
                      <span>{t('patient.liveQueue')}</span>
                    </h3>
                    <span className="text-xs font-bold px-3 py-1 bg-white/15 border border-white/25 text-amber-300 rounded-full shadow-sm backdrop-blur-md">
                      {selectedClinicName}
                    </span>
                  </div>

                  {activeToken ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center relative z-10">
                      {/* Token details badge */}
                      <motion.div 
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className={`p-6 rounded-[28px] ${
                          activeToken.isEmergency 
                            ? 'bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 text-white border-2 border-rose-300 shadow-[0_16px_50px_rgba(225,29,72,0.5)] ring-4 ring-rose-400/30 animate-pulse' 
                            : 'bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#f59e0b] text-slate-950 border border-amber-300/50 shadow-[0_16px_50px_rgba(234,88,12,0.4)]'
                        } flex flex-col items-center justify-center text-center relative overflow-hidden`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-xs font-black tracking-widest uppercase ${activeToken.isEmergency ? 'text-white' : 'text-slate-950/85'}`}>
                            {activeToken.isEmergency ? '🚨 EMERGENCY PRIORITY TOKEN' : t('patient.activeToken')}
                          </span>
                        </div>

                        <span className={`text-6xl sm:text-7xl font-black font-mono tracking-tight my-2 drop-shadow-sm ${activeToken.isEmergency ? 'text-white' : 'text-slate-950'}`}>
                          #{activeToken.tokenNumber}
                        </span>
                        <span className={`text-xs font-black px-3.5 py-1 rounded-full ${activeToken.isEmergency ? 'bg-white/20 border border-white/40 text-white' : 'bg-slate-950/20 border border-slate-950/30 text-slate-950'}`}>
                          {activeToken.deptName}
                        </span>
                        
                        {/* Booking metadata */}
                        <div className={`flex gap-4 mt-6 text-xs border-t pt-4 w-full justify-center font-bold ${activeToken.isEmergency ? 'border-white/20 text-white' : 'border-slate-950/20 text-slate-950/85'}`}>
                          <div className="flex items-center gap-1.5">
                            <Ticket size={13} />
                            <span className="capitalize">{activeToken.type}</span>
                          </div>
                          {activeToken.preferredTime && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} />
                              <span>{activeToken.preferredTime}</span>
                            </div>
                          )}
                        </div>

                        {/* Digital QR Pass Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setQrModalOpen(true)}
                          className="mt-4 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-950/30 hover:bg-slate-950/45 border border-white/30 text-white text-[11px] font-black cursor-pointer transition-all shadow-md backdrop-blur-md"
                        >
                          <QrCode size={13} />
                          <span>Show Digital QR Pass</span>
                        </motion.button>
                      </motion.div>

                      {/* Active Queue Status Grid */}
                      <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
                        <div className="glass-acrylic-pill p-4 rounded-2xl flex flex-col md:flex-row items-center md:justify-between gap-2 shadow-lg">
                          <span className="text-[10px] md:text-xs text-slate-200 font-bold uppercase tracking-wider">{t('patient.servingToken')}</span>
                          <span className="text-2xl font-black font-mono text-amber-400 drop-shadow-sm">#{serving}</span>
                        </div>

                        <div className="glass-acrylic-pill p-4 rounded-2xl flex flex-col md:flex-row items-center md:justify-between gap-2 shadow-lg">
                          <span className="text-[10px] md:text-xs text-slate-200 font-bold uppercase tracking-wider">{t('patient.yourPosition')}</span>
                          <span className={`text-2xl font-black font-mono ${position === 0 ? 'text-emerald-400 animate-pulse' : (activeToken.isEmergency ? 'text-rose-300 font-bold' : 'text-white')}`}>
                            {position === 0 ? 'Serving Now' : (activeToken.isEmergency ? 'Position #1 (Priority)' : position)}
                          </span>
                        </div>

                        <div className="glass-acrylic-pill p-4 rounded-2xl flex flex-col md:flex-row items-center md:justify-between gap-2 shadow-lg">
                          <span className="text-[10px] md:text-xs text-slate-200 font-bold uppercase tracking-wider">{t('patient.estWait')}</span>
                          <span className="text-2xl font-black font-mono text-amber-300 drop-shadow-sm">
                            {activeToken.isEmergency ? '0 mins (Immediate)' : (waitTime !== '-' ? `${waitTime} ${t('patient.mins')}` : '-')}
                          </span>
                        </div>
                      </div>

                      {/* Token Controller Action Buttons */}
                      <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/15">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setNewPrefTime(activeToken.preferredTime || '');
                            setRescheduleModalOpen(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/15 hover:bg-white/20 border border-white/25 rounded-2xl text-xs font-bold text-amber-300 shadow-lg cursor-pointer transition-all backdrop-blur-md"
                        >
                          <RefreshCw size={14} className="text-amber-400" />
                          <span>{t('patient.reschedule')}</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCancelToken}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-400/40 rounded-2xl text-xs font-bold text-rose-200 shadow-lg cursor-pointer transition-all backdrop-blur-md"
                        >
                          <X size={14} className="text-rose-400" />
                          <span>{t('patient.cancelToken')}</span>
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-14 text-slate-300 border border-dashed border-white/20 rounded-2xl bg-white/[0.04] relative z-10">
                      <Ticket size={48} className="text-amber-400/80 mb-3" />
                      <p className="text-sm font-bold text-slate-100">{t('patient.noActiveToken')}</p>
                    </div>
                  )}
                </motion.div>

                {/* Card 2: WhatsApp Live Queue Alerts Widget */}
                {activeToken && (
                  <motion.div 
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                          <MessageCircle size={20} />
                        </div>
                        <div>
                          <h3 className="text-md font-black text-white">WhatsApp Live Queue Alerts</h3>
                          <p className="text-[11px] text-slate-300">Get automatic alerts on your WhatsApp as your turn approaches.</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                        100% Free Instant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center relative z-10">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1">
                          Your WhatsApp Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="tel"
                            value={whatsappPhone}
                            onChange={(e) => setWhatsappPhone(e.target.value)}
                            placeholder="0300-1234567 or +923001234567"
                            className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white font-bold outline-none focus:border-emerald-400 shadow-md transition-all"
                          />
                        </div>
                      </div>

                      <div className="sm:self-end">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSendWhatsAppStatus}
                          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-300/40 cursor-pointer transition-all"
                        >
                          <Send size={13} />
                          <span>{whatsappSent ? 'Opening WhatsApp...' : 'Send WhatsApp Alert'}</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Card 3: Department-wise Queue Listing */}
                <motion.div 
                  custom={activeToken ? 3 : 2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                    <Ticket size={19} className="text-amber-400" />
                    <span>All Departments Status</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                    {departments.length > 0 ? (
                      departments.map(dept => {
                        const deptTokens = liveQueue[dept.name] || [];
                        const servingToken = deptTokens.find(t => t.status === 'serving');
                        const waitingCount = deptTokens.filter(t => t.status === 'waiting').length;

                        return (
                          <div key={dept.name} className="glass-acrylic-pill p-4 rounded-2xl hover:border-amber-400/40 flex items-center justify-between shadow-lg transition-all">
                            <div>
                              <span className="font-extrabold text-white text-sm">{dept.name}</span>
                              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-200 font-semibold">
                                <span>Serving: <strong className="text-amber-400 font-mono font-extrabold">#{servingToken ? servingToken.tokenNumber : '-'}</strong></span>
                                <span className="w-1 h-1 rounded-full bg-slate-400" />
                                <span>Waiting: <strong className="text-white font-extrabold">{waitingCount}</strong></span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Avg Wait</span>
                              <span className="text-sm font-black text-amber-300">{dept.avgTime} mins</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-sm text-slate-300 font-bold italic col-span-2 text-center py-4">
                        No departments configured for this facility.
                      </span>
                    )}
                  </div>
                </motion.div>

              </div>

              {/* Column 3: Book Token Form, Notifications, Feedback */}
              <div className="space-y-8">
                
                {/* Card 4: Book Token Card Form */}
                <motion.div 
                  custom={4}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                    <Calendar size={19} className="text-amber-400" />
                    <span>{t('patient.bookToken')}</span>
                  </h3>

                  <form onSubmit={handleBookToken} className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                        {t('patient.selectDept')}
                      </label>
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all cursor-pointer"
                      >
                        {departments.map(d => (
                          <option key={d.name} value={d.name} className="bg-slate-900 text-white">{d.name} ({d.avgTime}m avg)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                        Booking Mode
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#204351]/60 border border-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                        <button
                          type="button"
                          onClick={() => setBookingType('walk-in')}
                          className={`py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                            bookingType === 'walk-in' 
                              ? 'bg-gradient-to-r from-[#e57342] to-[#f97316] text-slate-950 font-black shadow-md' 
                              : 'text-slate-200 hover:text-white'
                          }`}
                        >
                          {t('patient.walkIn')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingType('appointment')}
                          className={`py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
                            bookingType === 'appointment' 
                              ? 'bg-gradient-to-r from-[#e57342] to-[#f97316] text-slate-950 font-black shadow-md' 
                              : 'text-slate-200 hover:text-white'
                          }`}
                        >
                          {t('patient.appointment')}
                        </button>
                      </div>
                    </div>

                    {bookingType === 'appointment' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('patient.appointmentTime')}
                        </label>
                        <input
                          type="time"
                          required
                          value={prefTime}
                          onChange={(e) => setPrefTime(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all"
                        />
                      </motion.div>
                    )}

                    {/* Emergency Priority Bypass Checkbox */}
                    <div className="pt-1">
                      <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                        isEmergency 
                          ? 'bg-rose-500/20 border-rose-400/50 shadow-md ring-2 ring-rose-500/30' 
                          : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isEmergency}
                          onChange={(e) => setIsEmergency(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                            <AlertTriangle size={13} className="text-rose-400" />
                            <span>Urgent / Critical Triage Bypass</span>
                          </span>
                          <p className="text-[10px] text-slate-300 font-medium">For chest pain, acute distress, or elderly emergency.</p>
                        </div>
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={departments.length === 0}
                      className={`w-full py-3 ${
                        isEmergency 
                          ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-rose-950/60' 
                          : 'bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] text-slate-950 shadow-orange-950/40'
                      } hover:brightness-110 font-black rounded-2xl text-xs uppercase tracking-wider border border-amber-300/40 shadow-xl transition-all cursor-pointer mt-4`}
                    >
                      {isEmergency ? '🚨 Confirm Emergency Token' : t('patient.confirmBooking')}
                    </motion.button>
                  </form>
                </motion.div>

                {/* Card 5: Notifications widget */}
                <motion.div 
                  custom={5}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                    <Bell size={19} className="text-amber-400" />
                    <span>{t('patient.notifications')}</span>
                  </h3>
                  
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 relative z-10">
                    {notifications.map(notif => (
                      <div key={notif.id} className="glass-acrylic-pill p-3.5 rounded-2xl flex gap-3 items-start shadow-md">
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-ping" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-100 font-semibold leading-normal">{notif.text}</p>
                          <span className="text-[10px] text-slate-300 font-bold block mt-1">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Card 6: Feedback & Star Rating Form */}
                <motion.div 
                  custom={6}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                    <MessageSquare size={19} className="text-amber-400" />
                    <span>{t('patient.feedback')}</span>
                  </h3>

                  {feedbackSuccess ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center text-center py-6 text-emerald-300 gap-2 font-bold relative z-10"
                    >
                      <CheckCircle2 size={36} className="text-emerald-400" />
                      <span className="text-sm">{t('patient.feedbackSuccess')}</span>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4 relative z-10">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('patient.rating')}
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none cursor-pointer transition-transform hover:scale-110 active:scale-95 p-1"
                            >
                              <Star
                                size={22}
                                fill={star <= rating ? '#f59e0b' : 'transparent'}
                                className={star <= rating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-slate-400/60'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <textarea
                          required
                          placeholder={t('patient.comments')}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={3}
                          className="w-full glass-input rounded-2xl p-3.5 text-xs text-white font-medium outline-none focus:border-amber-400 shadow-md transition-all resize-none"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-2.5 bg-white/15 hover:bg-white/20 border border-white/25 rounded-2xl text-xs font-bold text-amber-300 shadow-md cursor-pointer transition-all backdrop-blur-md"
                      >
                        {t('patient.submitFeedback')}
                      </motion.button>
                    </form>
                  )}
                </motion.div>

              </div>

            </div>
          </div>
        )}
      </main>

      {/* Digital QR Code Token Pass Modal */}
      <AnimatePresence>
        {qrModalOpen && activeToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-[32px] glass-acrylic-card p-6 border border-white/30 bg-[#162e3d]/95 backdrop-blur-2xl shadow-2xl relative overflow-hidden text-center select-none"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/15 mb-4">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-amber-400" />
                  <span className="text-sm font-black text-white">Digital Token Pass</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQrModalOpen(false)}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* QR Image */}
              <div className="p-4 bg-white rounded-2xl shadow-inner inline-block my-2">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Token QR Code" className="w-52 h-52 object-contain" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400 font-bold">Generating QR...</div>
                )}
              </div>

              <div className="mt-3 space-y-1">
                <span className="text-2xl font-black font-mono text-amber-400 block">Token #{activeToken.tokenNumber}</span>
                <span className="text-xs font-bold text-white block">{activeToken.deptName} • {selectedClinicName}</span>
                <span className="text-[11px] text-slate-300 block">Patient: {currentUser?.name || 'Friend'}</span>
              </div>

              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                Show this QR code at the doctor's desk or triage reception for immediate fast-track check-in.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {rescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-[32px] glass-acrylic-card p-6 border border-white/30 bg-[#162e3d]/95 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center pb-3 border-b border-white/15 mb-4 relative z-10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calendar size={16} className="text-amber-400" />
                  <span>Reschedule Token</span>
                </h3>
                <button
                  onClick={() => setRescheduleModalOpen(false)}
                  className="text-slate-300 hover:text-white cursor-pointer transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleReschedule} className="space-y-4 relative z-10">
                <div>
                  <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                    Choose New Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newPrefTime}
                    onChange={(e) => setNewPrefTime(e.target.value)}
                    className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRescheduleModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/15 hover:bg-white/20 text-slate-200 font-bold rounded-xl text-xs cursor-pointer border border-white/20 transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#e57342] to-[#ff9655] text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-lg hover:brightness-110 transition-all border border-amber-300/40"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multilingual AI Symptom Triage Chatbot */}
      <TriageChatbot
        mode="patient"
        departments={departments}
        liveQueue={liveQueue}
        clinicName={selectedClinicName}
        onSelectDepartment={(deptName) => {
          setSelectedDept(deptName);
          triggerAlert('success', `Triage recommendation applied: ${deptName}`);
        }}
      />
    </div>
  );
};

export default PatientDashboard;
