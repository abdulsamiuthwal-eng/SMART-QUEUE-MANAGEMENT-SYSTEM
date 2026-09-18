import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { queueService } from '../firebase/queueService';
import { 
  LogOut, Plus, Trash2, Calendar, Clock, Sparkles, 
  Play, RotateCcw, AlertTriangle, BarChart3, Settings, HelpCircle, UserCheck, CheckSquare, Languages, User,
  Package, TrendingUp, QrCode, Phone, MessageCircle, Send, CheckCircle2, ShieldAlert, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartQueueLogo } from '../components/SmartQueueLogo';
import { TriageChatbot } from '../components/TriageChatbot';
import SignOutConfirmModal from '../components/SignOutConfirmModal';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import dashboardLoungeArt from '../assets/dashboard_lounge.webp';

export const OrgDashboard = () => {
  useSmoothScroll();
  const { currentUser, logout } = useAuth();
  const { t, locale, toggleLanguage } = useLanguage();

  // Sign Out Confirmation Modal State
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  // Settings & Navigation States
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'departments' | 'supplies' | 'reports'
  const [departments, setDepartments] = useState([]);
  const [activeDept, setActiveDept] = useState('');
  
  // Real-time Queue Data
  const [liveQueue, setLiveQueue] = useState({});
  const [reports, setReports] = useState({ totalServed: 0, totalWaitTime: 0, totalSkipped: 0 });

  // Supply Alert & Inventory States
  const [supplies, setSupplies] = useState([]);
  const [newSupplyName, setNewSupplyName] = useState('');
  const [newSupplyCategory, setNewSupplyCategory] = useState('disposable');
  const [newSupplyQty, setNewSupplyQty] = useState('20');
  const [newSupplyThreshold, setNewSupplyThreshold] = useState('10');
  const [newSupplyUnit, setNewSupplyUnit] = useState('boxes');
  const [clinicWhatsApp, setClinicWhatsApp] = useState(() => localStorage.getItem('smart_queue_clinic_wa') || '03001234567');

  // AI Patient Load Forecast State
  const [forecast, setForecast] = useState(null);

  // Manual Token Generator Fields
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDept, setManualDept] = useState('');
  const [isEmergencyManual, setIsEmergencyManual] = useState(false);

  // Add Department Fields
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptTime, setNewDeptTime] = useState('10');

  // QR Token Verifier Modal States
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrScanInput, setQrScanInput] = useState('');
  const [verifiedTokenResult, setVerifiedTokenResult] = useState(null);

  // Notification Toast State
  const [alert, setAlert] = useState({ type: '', text: '' });

  // Page Loading state for Shimmer Glass Skeleton
  const [pageLoading, setPageLoading] = useState(true);

  // Intercept browser Back button and display premium Sign Out confirmation modal
  useEffect(() => {
    window.history.pushState({ page: 'org-dashboard' }, '', window.location.href);

    const handlePopState = () => {
      // Re-push history so user is not navigated back to login without confirmation
      window.history.pushState({ page: 'org-dashboard' }, '', window.location.href);
      setShowSignOutModal(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const triggerAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 5000);
  };

  // 1. Hook up to departments, live queue, supplies, and forecast on mount
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(() => setPageLoading(false), 600);

    const unsubscribeDepts = queueService.getDepartments(currentUser.uid, (data) => {
      setDepartments(data);
      if (data.length > 0) {
        setActiveDept(prev => prev || data[0].name);
        setManualDept(prev => prev || data[0].name);
      }
      setPageLoading(false);
    });

    const unsubscribeQueue = queueService.getLiveQueue(currentUser.uid, (queueData) => {
      setLiveQueue(queueData);
    });

    const unsubscribeReports = queueService.getReports(currentUser.uid, (reportData) => {
      setReports(reportData);
    });

    const unsubscribeSupplies = queueService.getSupplies(currentUser.uid, (supplyItems) => {
      setSupplies(supplyItems);
    });

    return () => {
      clearTimeout(timer);
      unsubscribeDepts();
      unsubscribeQueue();
      unsubscribeReports();
      unsubscribeSupplies();
    };
  }, [currentUser]);

  // Dynamically recalculate AI Patient Load Forecast whenever departments, live queues, or reports update
  useEffect(() => {
    if (!currentUser?.uid) return;
    const dynamicForecast = queueService.getPatientForecast(
      currentUser.uid,
      departments,
      liveQueue,
      reports
    );
    setForecast(dynamicForecast);
  }, [currentUser?.uid, departments, liveQueue, reports]);

  // Count low-stock items
  const lowStockItems = supplies.filter(item => item.quantity <= item.threshold);

  // 2. Actions: Call Next Patient
  const handleCallNext = async () => {
    if (!activeDept) return;
    try {
      const nextUser = await queueService.callNext(currentUser.uid, activeDept);
      if (nextUser) {
        triggerAlert('success', `${t('org.patientCalled')} (Token #${nextUser.tokenNumber} - ${nextUser.patientName} ${nextUser.isEmergency ? '🚨 EMERGENCY' : ''})`);
      } else {
        triggerAlert('warning', 'Queue is empty for this department.');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 3. Actions: Skip Current Patient (No-Show)
  const handleSkipPatient = async () => {
    if (!activeDept) return;
    
    const deptQueue = liveQueue[activeDept] || [];
    const servingPatient = deptQueue.find(p => p.status === 'serving');
    
    if (!servingPatient) {
      triggerAlert('warning', 'There is no patient currently serving.');
      return;
    }

    try {
      await queueService.skipPatient(currentUser.uid, activeDept);
      triggerAlert('warning', t('org.patientSkipped'));
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 4. Actions: Manual Token Generator (supports Emergency Bypass)
  const handleManualTokenSubmit = async (e) => {
    e.preventDefault();
    if (!manualDept) return;

    try {
      const pId = `walkin_patient_${Date.now()}`;
      const booked = await queueService.bookToken(
        currentUser.uid,
        manualDept,
        pId,
        manualName,
        manualPhone || 'N/A',
        'walk-in',
        '',
        isEmergencyManual,
        isEmergencyManual ? 'Emergency Triage Priority' : ''
      );

      triggerAlert('success', `Manual token generated: Token #${booked.tokenNumber} ${isEmergencyManual ? '(🚨 EMERGENCY PRIORITY)' : ''}`);
      setManualName('');
      setManualPhone('');
      setIsEmergencyManual(false);
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 5. Actions: Add Department
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName) return;

    try {
      await queueService.addDepartment(currentUser.uid, newDeptName, newDeptTime);
      triggerAlert('success', t('org.deptAdded'));
      setNewDeptName('');
      setNewDeptTime('10');
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 6. Actions: Delete Department
  const handleDeleteDept = async (deptName) => {
    if (!window.confirm(`Are you sure you want to delete the department: ${deptName}?`)) return;

    try {
      await queueService.deleteDepartment(currentUser.uid, deptName);
      triggerAlert('warning', t('org.deptDeleted'));
      if (activeDept === deptName) {
        setActiveDept('');
      }
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 7. Actions: Supply Stock Adjustments
  const handleStockChange = async (itemId, delta) => {
    try {
      await queueService.updateSupplyQuantity(currentUser.uid, itemId, delta);
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 8. Actions: Add New Supply Item
  const handleAddSupplySubmit = async (e) => {
    e.preventDefault();
    if (!newSupplyName.trim()) return;

    try {
      await queueService.addSupplyItem(currentUser.uid, {
        name: newSupplyName,
        category: newSupplyCategory,
        quantity: newSupplyQty,
        threshold: newSupplyThreshold,
        unit: newSupplyUnit
      });
      triggerAlert('success', `Supply item added: ${newSupplyName}`);
      setNewSupplyName('');
      setNewSupplyQty('20');
    } catch (err) {
      triggerAlert('error', err.message);
    }
  };

  // 9. Actions: Send WhatsApp Restock Alert to Procurement
  const handleOrderSupplyWhatsApp = (item) => {
    const msg = `🚨 *URGENT MEDICAL SUPPLY ALERT*\n\n` +
      `*Facility:* ${currentUser?.hospitalName || 'Clinic'}\n` +
      `*Item:* ${item.name} (${item.category.toUpperCase()})\n` +
      `*Current Stock:* ${item.quantity} ${item.unit}\n` +
      `*Minimum Safety Limit:* ${item.threshold} ${item.unit}\n\n` +
      `_Stock is below threshold! Please arrange immediate restock for OPD continuity._`;

    const url = queueService.generateWhatsAppUrl(clinicWhatsApp, msg);
    window.open(url, '_blank');
    triggerAlert('success', `Opening WhatsApp alert for ${item.name}...`);
  };

  // 10. Actions: Verify QR Token
  const handleVerifyQr = async (e) => {
    e.preventDefault();
    if (!qrScanInput.trim()) return;

    const result = await queueService.verifyTokenByQr(currentUser.uid, qrScanInput);
    if (result.found) {
      setVerifiedTokenResult(result);
      triggerAlert('success', `Verified Token #${result.token.tokenNumber} for ${result.token.patientName}!`);
    } else {
      setVerifiedTokenResult(null);
      triggerAlert('error', 'Token not found or invalid QR payload.');
    }
  };

  // Save Clinic WhatsApp
  const handleSaveClinicWhatsApp = () => {
    localStorage.setItem('smart_queue_clinic_wa', clinicWhatsApp);
    triggerAlert('success', 'Staff WhatsApp alert number saved successfully.');
  };

  // Calculations for Load Indication
  const getDeptLoad = (deptName) => {
    const deptQueue = liveQueue[deptName] || [];
    const waitingCount = deptQueue.filter(p => p.status === 'waiting').length;

    if (waitingCount <= 2) return { label: t('org.loadLow'), color: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300', level: 'Low' };
    if (waitingCount <= 5) return { label: t('org.loadMedium'), color: 'bg-amber-500/20 border-amber-400/30 text-amber-300', level: 'Medium' };
    return { label: t('org.loadHigh'), color: 'bg-rose-500/20 border-rose-400/30 text-rose-300', level: 'High' };
  };

  // All clinic tokens across all departments for real-time reporting
  const allClinicTokens = Object.values(liveQueue || {}).flat();
  const allCompletedTokens = allClinicTokens.filter(p => p.status === 'completed');
  const allSkippedTokens = allClinicTokens.filter(p => p.status === 'skipped');
  const allWaitingTokens = allClinicTokens.filter(p => p.status === 'waiting');
  const allEmergencyWaiting = allWaitingTokens.filter(p => p.isEmergency);

  // Real-time KPI Counts: max of reports counter and active completed/skipped tokens
  const realTotalServed = Math.max(Number(reports.totalServed) || 0, allCompletedTokens.length);
  const realTotalSkipped = Math.max(Number(reports.totalSkipped) || 0, allSkippedTokens.length);

  // Real-time Average Wait Time calculation from completed tokens & reports
  let avgWaitTimeFormatted = 0;
  if (allCompletedTokens.length > 0) {
    const totalMins = allCompletedTokens.reduce((acc, t) => {
      const wait = t.completedAt ? Math.round((t.completedAt - t.timestamp) / 60000) : 10;
      return acc + Math.max(1, wait);
    }, 0);
    avgWaitTimeFormatted = Math.round(totalMins / allCompletedTokens.length);
  } else if (reports.totalServed > 0 && reports.totalWaitTime > 0) {
    avgWaitTimeFormatted = Math.round(reports.totalWaitTime / reports.totalServed);
  } else if (departments.length > 0) {
    avgWaitTimeFormatted = Math.round(
      departments.reduce((acc, d) => acc + (Number(d.avgTime) || 10), 0) / departments.length
    );
  } else {
    avgWaitTimeFormatted = 10;
  }

  // Real-time Hourly Token Inflow calculation from tokens created today
  const morningTokens = allClinicTokens.filter(t => {
    if (!t.timestamp) return false;
    const hr = new Date(t.timestamp).getHours();
    return hr >= 8 && hr < 12; // 8:00 AM - 12:00 PM
  });
  const afternoonTokens = allClinicTokens.filter(t => {
    if (!t.timestamp) return false;
    const hr = new Date(t.timestamp).getHours();
    return hr >= 12 && hr < 15; // 12:00 PM - 3:00 PM
  });
  const eveningTokens = allClinicTokens.filter(t => {
    if (!t.timestamp) return false;
    const hr = new Date(t.timestamp).getHours();
    return hr >= 15 && hr < 22; // 3:00 PM - 10:00 PM
  });

  const totalInflowCount = morningTokens.length + afternoonTokens.length + eveningTokens.length;

  let morningPct = 45;
  let afternoonPct = 35;
  let eveningPct = 20;

  if (totalInflowCount > 0) {
    morningPct = Math.round((morningTokens.length / totalInflowCount) * 100);
    afternoonPct = Math.round((afternoonTokens.length / totalInflowCount) * 100);
    eveningPct = Math.max(0, 100 - morningPct - afternoonPct);
  }

  // Selected Department Details (with Emergency sorting)
  const activeDeptQueue = liveQueue[activeDept] || [];
  const servingPatient = activeDeptQueue.find(p => p.status === 'serving');
  const waitingPatients = activeDeptQueue
    .filter(p => p.status === 'waiting')
    .sort((a, b) => {
      if (a.isEmergency && !b.isEmergency) return -1;
      if (!a.isEmergency && b.isEmergency) return 1;
      return a.timestamp - b.timestamp;
    });
  const completedCount = activeDeptQueue.filter(p => p.status === 'completed').length;
  const skippedCount = activeDeptQueue.filter(p => p.status === 'skipped').length;

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
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none bg-[#11242d] transition-opacity duration-700 ease-out"
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

      {/* Floating Pill-Shaped Nav Header */}
      <div className="sticky top-2 sm:top-3.5 z-40 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pointer-events-none transition-all duration-300">
        <nav className="pointer-events-auto rounded-full border border-white/25 bg-[#162d3a]/85 backdrop-blur-2xl px-3.5 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          <div className="w-full sm:w-auto flex justify-between sm:justify-start items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SmartQueueLogo size={36} animated={true} className="shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-white drop-shadow-sm truncate">{t('org.dashboard')}</h1>
                <p className="text-[9px] sm:text-[10px] text-amber-300 uppercase tracking-wider font-extrabold truncate max-w-[160px] sm:max-w-none">{t('org.welcome')} {currentUser?.hospitalName}</p>
              </div>
            </div>

            {/* Quick Actions for Mobile Top-Right */}
            <div className="flex sm:hidden items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold text-amber-300 backdrop-blur-md cursor-pointer shadow-sm"
              >
                <Languages size={13} />
                <span>{locale === 'en' ? 'اردو' : 'EN'}</span>
              </button>
              <button
                onClick={() => setShowSignOutModal(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/20 border border-rose-400/35 rounded-full text-[11px] font-bold text-rose-200 cursor-pointer shadow-sm"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          {/* Dashboard Nav links, language toggle, & logout */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="w-full sm:w-auto flex items-center gap-1 bg-white/10 border border-white/20 p-1 rounded-full text-xs shadow-inner backdrop-blur-md overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-bold cursor-pointer transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
                  activeTab === 'queue' ? 'bg-gradient-to-r from-[#e57342] to-[#f97316] text-slate-950 font-black shadow-md' : 'text-slate-200 hover:text-white'
                }`}
              >
                {t('org.tabQueue')}
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-bold cursor-pointer transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
                  activeTab === 'departments' ? 'bg-gradient-to-r from-[#e57342] to-[#f97316] text-slate-950 font-black shadow-md' : 'text-slate-200 hover:text-white'
                }`}
              >
                {t('org.tabDepartments')}
              </button>
              <button
                onClick={() => setActiveTab('supplies')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-bold cursor-pointer transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'supplies' ? 'bg-gradient-to-r from-[#e57342] to-[#f97316] text-slate-950 font-black shadow-md' : 'text-slate-200 hover:text-white'
                }`}
              >
                <span>{t('org.tabSupplies')}</span>
                {lowStockItems.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                    {lowStockItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 sm:px-4 py-1.5 rounded-full font-bold cursor-pointer transition-all whitespace-nowrap text-[11px] sm:text-xs shrink-0 ${
                  activeTab === 'reports' ? 'bg-gradient-to-r from-[#e57342] to-[#f97316] text-slate-950 font-black shadow-md' : 'text-slate-200 hover:text-white'
                }`}
              >
                {t('org.tabReports')}
              </button>
            </div>

            {/* Language & Logout for Desktop */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-bold text-amber-300 transition-all cursor-pointer backdrop-blur-md shadow-sm"
              >
                <Languages size={14} />
                <span>{locale === 'en' ? 'اردو' : 'English'}</span>
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSignOutModal(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/20 border border-rose-400/35 rounded-full text-xs font-extrabold text-rose-200 hover:bg-rose-500/30 cursor-pointer transition-all shadow-sm"
              >
                <LogOut size={13} />
                <span>{t('common.logout')}</span>
              </motion.button>
            </div>
          </div>
        </nav>
      </div>

      {/* Alert toast notification */}
      <AnimatePresence>
        {alert.text && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-xl max-w-[90vw] ${
              alert.type === 'success' 
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-950/40' 
                : 'bg-amber-950/80 border-amber-500/40 text-amber-200 shadow-amber-950/40'
            }`}
          >
            {alert.type === 'success' ? <UserCheck size={16} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
            <span className="truncate">{alert.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6 relative z-10">
        
        {/* Persistent Low Stock Warning Banner on Live Queue tab */}
        {activeTab === 'queue' && lowStockItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0 animate-pulse">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black text-rose-200">
                  {t('org.criticalSupplyAlert')}: {lowStockItems.length} {t('org.belowThreshold')}
                </h4>
                <p className="text-[11px] text-slate-300">
                  {lowStockItems.map(i => `${i.name} (${i.quantity} ${i.unit} left)`).join(' • ')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('supplies')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-slate-200 cursor-pointer transition-all"
              >
                {t('org.viewInventory')}
              </button>
              <button
                onClick={() => handleOrderSupplyWhatsApp(lowStockItems[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer shadow-md transition-all"
              >
                <MessageCircle size={13} />
                <span>{t('org.waRestockAlert')}</span>
              </button>
            </div>
          </motion.div>
        )}

        {pageLoading ? (
          /* SHIMMER GLASS SKELETON LOADER FOR ORG DASHBOARD */
          <div className="space-y-8 animate-fade-in pointer-events-none">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-6 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-44 glass-skeleton" />
                    <div className="h-8 w-32 glass-skeleton rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="h-52 glass-skeleton rounded-[28px]" />
                    <div className="space-y-4">
                      <div className="h-14 glass-skeleton rounded-2xl" />
                      <div className="h-12 glass-skeleton rounded-2xl" />
                      <div className="h-12 glass-skeleton rounded-2xl" />
                    </div>
                  </div>
                </div>

                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-4 shadow-2xl">
                  <div className="h-6 w-40 glass-skeleton" />
                  <div className="h-28 glass-skeleton rounded-2xl" />
                </div>
              </div>

              <div className="space-y-8">
                <div className="glass-acrylic-card rounded-[32px] p-6 sm:p-7 space-y-4 shadow-2xl">
                  <div className="h-6 w-36 glass-skeleton" />
                  <div className="h-10 glass-skeleton rounded-2xl" />
                  <div className="h-10 glass-skeleton rounded-2xl" />
                  <div className="h-10 glass-skeleton rounded-2xl" />
                  <div className="h-12 glass-skeleton rounded-2xl mt-2" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* TAB 1: LIVE QUEUE CONTROL */}
            {/* ========================================================================= */}
            {activeTab === 'queue' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Live Serving & Queue controller */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Card 1: Serving Controller */}
                  <motion.div 
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6 border-b border-white/15 pb-4 relative z-10">
                      <div>
                        <h3 className="text-base sm:text-lg font-black flex items-center gap-2 text-white drop-shadow-sm">
                          <Clock size={19} className="text-amber-400 shrink-0" />
                          <span>{t('org.liveQueueMgmt')}</span>
                        </h3>
                        <p className="text-xs text-slate-200 font-medium mt-0.5">{t('org.advanceQueueHelp')}</p>
                      </div>
                      
                      {/* Department Picker & QR Scanner Button */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                        <select
                          value={activeDept}
                          onChange={(e) => setActiveDept(e.target.value)}
                          className="flex-1 sm:flex-initial glass-input rounded-2xl px-3.5 sm:px-4 py-2 text-xs outline-none focus:border-amber-400 cursor-pointer text-white font-bold shadow-lg transition-all"
                        >
                          {departments.map(d => (
                            <option key={d.name} value={d.name} className="bg-slate-900 text-white">{d.name}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => setQrModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-bold cursor-pointer transition-all shadow-md shrink-0"
                        >
                          <QrCode size={14} />
                          <span>{t('org.scanQrBtn')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Queue Board */}
                    {activeDept ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-center relative z-10">
                        
                        {/* Serving Box Card */}
                        <div className={`p-4 sm:p-6 rounded-[22px] sm:rounded-[28px] ${
                          servingPatient?.isEmergency 
                            ? 'bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 text-white border-2 border-rose-300 shadow-[0_16px_50px_rgba(225,29,72,0.5)] animate-pulse'
                            : 'bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#f59e0b] text-slate-950 border border-amber-300/50 shadow-[0_16px_50px_rgba(234,88,12,0.4)]'
                        } flex flex-col items-center justify-center text-center min-h-[190px] sm:min-h-[200px] relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                          
                          <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase mb-1 ${servingPatient?.isEmergency ? 'text-white' : 'text-slate-950/85'}`}>
                            {servingPatient?.isEmergency ? t('org.emergencyServingBadge') : t('patient.servingToken')}
                          </span>
                          
                          {servingPatient ? (
                            <>
                              <span className={`text-5xl xs:text-6xl sm:text-7xl font-black font-mono tracking-tight my-1.5 sm:my-2 drop-shadow-sm ${servingPatient.isEmergency ? 'text-white' : 'text-slate-950'}`}>
                                #{servingPatient.tokenNumber}
                              </span>
                              <span className={`text-xs sm:text-sm font-black mt-1 ${servingPatient.isEmergency ? 'text-white' : 'text-slate-950'}`}>
                                {servingPatient.patientName}
                              </span>
                              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${servingPatient.isEmergency ? 'text-white/90' : 'text-slate-950/80'}`}>
                                {servingPatient.patientPhone}
                              </span>
                            </>
                          ) : (
                            <div className="flex flex-col items-center py-4 text-slate-950/70">
                              <RotateCcw size={32} className="text-slate-950/60 mb-2 animate-spin-slow" />
                              <span className="text-xs font-black">{t('org.noPatientServing')}</span>
                            </div>
                          )}
                        </div>

                        {/* Controller Action buttons */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCallNext}
                            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-xl shadow-orange-950/40 border border-amber-300/40 transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Play size={14} className="fill-current text-slate-950" />
                            <span>{t('org.callNext')}</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSkipPatient}
                            disabled={!servingPatient}
                            className="w-full py-2.5 sm:py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl text-xs font-bold text-rose-300 hover:text-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 backdrop-blur-md shadow-sm disabled:opacity-50"
                          >
                            <AlertTriangle size={14} className="text-rose-400" />
                            <span>{t('org.skipNoShow')}</span>
                          </motion.button>
                          
                          <div className="flex justify-around text-center pt-3 border-t border-white/15 mt-1 text-xs font-semibold">
                            <div className="glass-acrylic-pill px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex-1 mx-1 text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-300">{t('org.waitingCountLabel')}</span>
                              <span className="text-sm sm:text-base font-black text-white mt-0.5 block">{waitingPatients.length}</span>
                            </div>
                            <div className="glass-acrylic-pill px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex-1 mx-1 text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-300">{t('org.servedCountLabel')}</span>
                              <span className="text-sm sm:text-base font-black text-amber-400 mt-0.5 block">{completedCount}</span>
                            </div>
                            <div className="glass-acrylic-pill px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex-1 mx-1 text-center">
                              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-300">{t('org.skippedCountLabel')}</span>
                              <span className="text-sm sm:text-base font-black text-rose-400 mt-0.5 block">{skippedCount}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-slate-300 border border-dashed border-white/20 rounded-2xl relative z-10">
                        <Settings size={36} className="mb-2 text-amber-400/80" />
                        <span className="font-bold text-xs sm:text-sm">{t('org.pleaseAddDept')}</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Card 2: Waiting Patients List Table */}
                  {activeDept && (
                    <motion.div 
                      custom={2}
                      initial="hidden"
                      animate="visible"
                      variants={fadeScrollVariants}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
                    >
                      <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                      <h3 className="text-sm sm:text-base font-black mb-3.5 sm:mb-4 text-white drop-shadow-sm relative z-10 flex items-center gap-2">
                        <UserCheck size={18} className="text-amber-400 shrink-0" />
                        <span>{t('org.patientsWaitingList')} ({waitingPatients.length})</span>
                      </h3>
                      
                      <div className="overflow-x-auto relative z-10 no-scrollbar">
                        <table className="w-full min-w-[560px] text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/15 text-slate-300">
                              <th className="py-2.5 font-bold uppercase tracking-wider">{t('org.colNo')}</th>
                              <th className="py-2.5 font-bold uppercase tracking-wider">{t('org.colPatient')}</th>
                              <th className="py-2.5 font-bold uppercase tracking-wider">{t('org.colContact')}</th>
                              <th className="py-2.5 font-bold uppercase tracking-wider">{t('org.colMode')}</th>
                              <th className="py-2.5 font-bold uppercase tracking-wider">{t('org.colCheckIn')}</th>
                              <th className="py-2.5 font-bold uppercase tracking-wider">{t('org.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {waitingPatients.map((patient) => (
                              <tr 
                                key={patient.tokenId} 
                                className={`border-b transition-colors ${
                                  patient.isEmergency 
                                    ? 'bg-rose-500/15 border-rose-400/35 hover:bg-rose-500/25' 
                                    : 'border-white/10 hover:bg-white/[0.05]'
                                }`}
                              >
                                <td className="py-3 font-mono font-black">
                                  {patient.isEmergency ? (
                                    <span className="inline-flex items-center gap-1 text-rose-300 font-black">
                                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                                      #{patient.tokenNumber} ({t('org.urgentBadge')})
                                    </span>
                                  ) : (
                                    <span className="text-amber-400">#{patient.tokenNumber}</span>
                                  )}
                                </td>
                                <td className="py-3 font-bold text-white">{patient.patientName}</td>
                                <td className="py-3 font-mono text-slate-300 font-medium">{patient.patientPhone}</td>
                                <td className="py-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    patient.isEmergency 
                                      ? 'bg-rose-500/25 border-rose-400/40 text-rose-200'
                                      : (patient.type === 'appointment' ? 'bg-amber-500/20 border-amber-400/30 text-amber-300' : 'bg-white/10 border-white/15 text-slate-200')
                                  }`}>
                                    {patient.isEmergency ? t('org.emergencyBypassTag') : (patient.type === 'appointment' ? `${patient.preferredTime}` : t('patient.walkIn'))}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-300 font-mono font-medium">
                                  {new Date(patient.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3">
                                  <span className={`flex items-center gap-1.5 font-bold ${patient.isEmergency ? 'text-rose-300' : 'text-emerald-300'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${patient.isEmergency ? 'bg-rose-400' : 'bg-emerald-400'} animate-ping`} />
                                    <span>{patient.isEmergency ? t('org.priorityTopBadge') : t('org.waiting')}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {waitingPatients.length === 0 && (
                              <tr>
                                <td colSpan={6} className="text-center py-6 text-slate-300 italic font-bold">{t('org.noPatientsWaiting')}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Right Panel: Manual Token Generator & Load Indicators */}
                <div className="space-y-8">
                  
                  {/* Card 3: Manual Token Generator (with Emergency Triage Bypass) */}
                  <motion.div 
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                    <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-5 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                      <Sparkles size={19} className="text-amber-400 shrink-0" />
                      <span>{t('org.manualToken')}</span>
                    </h3>

                    <form onSubmit={handleManualTokenSubmit} className="space-y-3.5 sm:space-y-4 relative z-10">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('org.patientName')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Jane Doe"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('org.phone')} ({locale === 'ur' ? 'اختیاری' : 'Optional'})
                        </label>
                        <input
                          type="tel"
                          placeholder="0300-XXXXXXX"
                          value={manualPhone}
                          onChange={(e) => setManualPhone(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('org.selectDept')}
                        </label>
                        <select
                          value={manualDept}
                          onChange={(e) => setManualDept(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all cursor-pointer"
                        >
                          {departments.map(d => (
                            <option key={d.name} value={d.name} className="bg-slate-900 text-white">{d.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Emergency / Critical Priority Bypass Checkbox */}
                      <div>
                        <label className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                          isEmergencyManual 
                            ? 'bg-rose-500/20 border-rose-400/50 shadow-md ring-2 ring-rose-500/30' 
                            : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                        }`}>
                          <input
                            type="checkbox"
                            checked={isEmergencyManual}
                            onChange={(e) => setIsEmergencyManual(e.target.checked)}
                            className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                              <ShieldAlert size={14} className="text-rose-400 shrink-0" />
                              <span className="truncate">{t('org.emergencyBypassLabel')}</span>
                            </span>
                            <p className="text-[10px] text-slate-300 font-medium leading-tight mt-0.5">{t('org.emergencyBypassHelp')}</p>
                          </div>
                        </label>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={departments.length === 0}
                        className={`w-full py-3 ${
                          isEmergencyManual 
                            ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white shadow-rose-950/60' 
                            : 'bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] text-slate-950 shadow-orange-950/40'
                        } hover:brightness-110 font-black rounded-2xl text-xs uppercase tracking-wider border border-amber-300/40 shadow-xl transition-all cursor-pointer mt-4`}
                      >
                        {isEmergencyManual ? t('org.issueEmergencyBtn') : t('org.generateToken')}
                      </motion.button>
                    </form>
                  </motion.div>

                  {/* Card 4: Department Load Indicators */}
                  <motion.div 
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                    <h3 className="text-base sm:text-lg font-black mb-3.5 sm:mb-4 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                      <BarChart3 size={19} className="text-amber-400 shrink-0" />
                      <span>{t('org.deptLoad')}</span>
                    </h3>

                    <div className="space-y-4 relative z-10">
                      {departments.map(dept => {
                        const load = getDeptLoad(dept.name);
                        const deptQueue = liveQueue[dept.name] || [];
                        const waiting = deptQueue.filter(p => p.status === 'waiting').length;
                        const pct = Math.min(100, Math.round((waiting / 8) * 100));

                        return (
                          <div key={dept.name} className="glass-acrylic-pill p-3.5 rounded-2xl space-y-2.5 shadow-md">
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className="font-extrabold text-white">{dept.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${load.color}`}>
                                {load.label}
                              </span>
                            </div>

                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  load.level === 'Low' ? 'bg-emerald-400' : (load.level === 'Medium' ? 'bg-amber-400' : 'bg-rose-400')
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                              <span>{waiting} {t('org.patientsWaiting')}</span>
                              <span>{t('org.estWaitPrefix')} {waiting * dept.avgTime}m</span>
                            </div>
                          </div>
                        );
                      })}
                      {departments.length === 0 && (
                        <span className="text-xs text-slate-300 font-bold italic block text-center py-3">{t('org.noDeptsActive')}</span>
                      )}
                    </div>
                  </motion.div>

                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: MANAGE DEPARTMENTS */}
            {/* ========================================================================= */}
            {activeTab === 'departments' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Department add form */}
                <motion.div 
                  custom={1}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 h-fit relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-5 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                    <Settings size={19} className="text-amber-400 shrink-0" />
                    <span>{t('org.addDept')}</span>
                  </h3>

                  <form onSubmit={handleAddDept} className="space-y-3.5 sm:space-y-4 relative z-10">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                        {t('org.deptName')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cardiology, ENT"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-bold shadow-lg transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                        {t('org.avgServiceTime')}
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newDeptTime}
                        onChange={(e) => setNewDeptTime(e.target.value)}
                        className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs outline-none focus:border-amber-400 text-white font-mono font-bold shadow-lg transition-all"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#e57342] via-[#ff9655] to-[#e57342] hover:brightness-110 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider border border-amber-300/40 shadow-xl shadow-orange-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                      <Plus size={14} />
                      <span>{t('org.addDeptBtn')}</span>
                    </motion.button>
                  </form>
                </motion.div>

                {/* Department listing */}
                <motion.div 
                  custom={2}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="lg:col-span-2 glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <h3 className="text-base sm:text-lg font-black mb-4 sm:mb-5 flex items-center gap-2 text-white drop-shadow-sm relative z-10">
                    <Settings size={19} className="text-amber-400 shrink-0" />
                    <span>{t('org.activeDeptsTitle')} ({departments.length})</span>
                  </h3>

                  <div className="space-y-3 sm:space-y-4 relative z-10">
                    {departments.map(d => (
                      <div key={d.name} className="glass-acrylic-pill p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-lg hover:border-amber-400/40 transition-all">
                        <div>
                          <h4 className="font-black text-sm sm:text-base text-white">{d.name}</h4>
                          <div className="flex flex-wrap gap-2.5 sm:gap-4 mt-1 text-xs font-semibold text-slate-300">
                            <span>{t('org.avgServiceLabel')} <strong className="text-amber-400">{d.avgTime} {t('patient.mins')}</strong></span>
                            <span>{t('org.loadLabel')} <strong className="text-white">{((liveQueue[d.name] || []).filter(t=>t.status==='waiting')).length} {t('org.patientUnit')}</strong></span>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteDept(d.name)}
                          className="p-2 sm:p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/35 text-rose-300 hover:bg-rose-500/30 hover:text-white transition-all cursor-pointer shrink-0 ml-2"
                        >
                          <Trash2 size={15} />
                        </motion.button>
                      </div>
                    ))}
                    {departments.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-slate-300 border border-dashed border-white/20 rounded-2xl">
                        <HelpCircle size={36} className="mb-2 text-amber-400/80" />
                        <span className="font-bold text-xs sm:text-sm">{t('org.noActiveDepts')}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: SUPPLY ALERT & INVENTORY SYSTEM */}
            {/* ========================================================================= */}
            {activeTab === 'supplies' && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                
                {/* Supplies Overview KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  <motion.div 
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center text-amber-300 relative z-10 shrink-0">
                      <Package size={22} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('org.totalTrackedItems')}</span>
                      <span className="block text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">{supplies.length}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-center text-emerald-300 relative z-10 shrink-0">
                      <CheckCircle2 size={22} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('org.optimalStockItems')}</span>
                      <span className="block text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">{supplies.length - lowStockItems.length}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-rose-500/20 border border-rose-400/40 rounded-2xl flex items-center justify-center text-rose-300 relative z-10 shrink-0">
                      <AlertTriangle size={22} className="animate-pulse" />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('org.lowStockAlerts')}</span>
                      <span className="block text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-0.5">{lowStockItems.length}</span>
                    </div>
                  </motion.div>
                </div>

                {/* WhatsApp Staff Notification Settings */}
                <motion.div
                  custom={4}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 sm:gap-4 relative overflow-hidden"
                >
                  <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white">{t('org.waRecipientTitle')}</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-300">{t('org.waRecipientDesc')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="tel"
                      value={clinicWhatsApp}
                      onChange={(e) => setClinicWhatsApp(e.target.value)}
                      placeholder="0300-1234567"
                      className="glass-input rounded-2xl px-3.5 py-2 text-xs text-white font-bold outline-none focus:border-emerald-400 shadow-inner w-full sm:w-48"
                    />
                    <button
                      onClick={handleSaveClinicWhatsApp}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs cursor-pointer shadow-md transition-all shrink-0"
                    >
                      {t('org.save')}
                    </button>
                  </div>
                </motion.div>

                {/* Main Supplies Management Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Supplies Table */}
                  <div className="lg:col-span-2 glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-center mb-4 sm:mb-5 relative z-10">
                      <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                        <Package size={19} className="text-amber-400 shrink-0" />
                        <span>{t('org.opdInventoryTitle')}</span>
                      </h3>
                      <span className="text-xs font-bold text-slate-300 hidden sm:inline">{t('org.realtimeStockMonitor')}</span>
                    </div>

                    <div className="overflow-x-auto relative z-10 no-scrollbar">
                      <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-white/15 text-slate-300">
                            <th className="py-2.5 font-bold uppercase">{t('org.colItemName')}</th>
                            <th className="py-2.5 font-bold uppercase">{t('org.colCategory')}</th>
                            <th className="py-2.5 font-bold uppercase text-center">{t('org.colInStock')}</th>
                            <th className="py-2.5 font-bold uppercase">{t('org.colSafetyMin')}</th>
                            <th className="py-2.5 font-bold uppercase">{t('org.status')}</th>
                            <th className="py-2.5 font-bold uppercase text-right">{t('org.colQuickAlert')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {supplies.map((item) => {
                            const isLow = item.quantity <= item.threshold;
                            return (
                              <tr key={item.id} className={`border-b transition-colors ${isLow ? 'bg-rose-500/10 border-rose-500/20' : 'border-white/10 hover:bg-white/[0.04]'}`}>
                                <td className="py-3.5 font-extrabold text-white">{item.name}</td>
                                <td className="py-3.5">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15 uppercase">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-3.5">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStockChange(item.id, -1)}
                                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className={`font-mono font-black text-sm ${isLow ? 'text-rose-400' : 'text-white'}`}>
                                      {item.quantity} {item.unit}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleStockChange(item.id, 5)}
                                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3.5 font-mono text-slate-300 font-bold">{item.threshold} {item.unit}</td>
                                <td className="py-3.5">
                                  {isLow ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 font-black text-[10px] animate-pulse">
                                      <AlertTriangle size={11} />
                                      <span>{t('org.lowStockBadge')}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-[10px]">
                                      <CheckCircle2 size={11} />
                                      <span>{t('org.optimalBadge')}</span>
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleOrderSupplyWhatsApp(item)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold cursor-pointer transition-all shadow-sm"
                                  >
                                    <MessageCircle size={12} />
                                    <span>WhatsApp</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add New Supply Item Form */}
                  <div className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 shadow-2xl h-fit relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 mb-4 sm:mb-5 relative z-10">
                      <Plus size={19} className="text-amber-400 shrink-0" />
                      <span>{t('org.registerItemTitle')}</span>
                    </h3>

                    <form onSubmit={handleAddSupplySubmit} className="space-y-3.5 sm:space-y-4 relative z-10">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('org.itemNameLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Amoxicillin 500mg, ECG Rolls"
                          value={newSupplyName}
                          onChange={(e) => setNewSupplyName(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-400 shadow-md transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('org.colCategory')}
                        </label>
                        <select
                          value={newSupplyCategory}
                          onChange={(e) => setNewSupplyCategory(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-400 shadow-md transition-all cursor-pointer"
                        >
                          <option value="medicine" className="bg-slate-900 text-white">{t('org.catMedicine')}</option>
                          <option value="disposable" className="bg-slate-900 text-white">{t('org.catDisposable')}</option>
                          <option value="equipment" className="bg-slate-900 text-white">{t('org.catEquipment')}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                            {t('org.initialQtyLabel')}
                          </label>
                          <input
                            type="number"
                            required
                            min={0}
                            value={newSupplyQty}
                            onChange={(e) => setNewSupplyQty(e.target.value)}
                            className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-400 shadow-md transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                            {t('org.alertThresholdLabel')}
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={newSupplyThreshold}
                            onChange={(e) => setNewSupplyThreshold(e.target.value)}
                            className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-400 shadow-md transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                          {t('org.measuringUnitLabel')}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="boxes, packs, vials, units"
                          value={newSupplyUnit}
                          onChange={(e) => setNewSupplyUnit(e.target.value)}
                          className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-amber-400 shadow-md transition-all"
                        />
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-[#e57342] to-[#ff9655] text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer mt-3"
                      >
                        {t('org.addToStockBtn')}
                      </motion.button>
                    </form>
                  </div>
                </div>

              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 4: ANALYTICS, REPORTS & AI FORECAST */}
            {/* ========================================================================= */}
            {activeTab === 'reports' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* 1. AI DAILY PATIENT LOAD FORECAST CARD */}
                {forecast && (
                  <motion.div
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-8 relative overflow-hidden shadow-2xl border-2 border-amber-400/30"
                  >
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 sm:gap-4 mb-4 sm:mb-6 pb-4 border-b border-white/15 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-[#e57342] flex items-center justify-center text-slate-950 shadow-lg shrink-0">
                          <TrendingUp size={22} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg sm:text-xl font-black text-white">{t('org.dailyForecastTitle')}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] sm:text-[10px] font-black">
                              {forecast.confidenceRate} {t('org.aiConfidenceRate')}
                            </span>
                          </div>
                          <p className="text-xs text-amber-300 font-bold">{t('org.projectionsFor')} {forecast.dateString}</p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold block">{t('org.estimatedInflow')}</span>
                        <span className="text-2xl sm:text-3xl font-black font-mono text-white">~{forecast.totalExpected} <span className="text-xs sm:text-sm font-bold text-amber-300">{t('org.patientsLabel')}</span></span>
                      </div>
                    </div>

                    {/* Department-wise Projection breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 relative z-10">
                      {forecast.deptForecast.map((dept) => (
                        <div key={dept.name} className="glass-acrylic-pill p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 shadow-md">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-white">{dept.name}</span>
                            <span className="font-mono font-black text-amber-300">~{dept.expectedPatients} {t('org.patientsLabel')}</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-[#e57342] to-[#ff9655]"
                              style={{ width: `${Math.min(100, (dept.expectedPatients / forecast.totalExpected) * 200)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-300 font-bold">
                            <span>Peak: {dept.peakHour}</span>
                            <span>{dept.recommendedDesks} {t('org.countersNeeded')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Proactive AI Staffing Recommendations */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 relative z-10 space-y-2">
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} className="shrink-0" />
                        <span>{t('org.aiStaffingTitle')}</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {forecast.aiRecommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {/* 2. KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                  <motion.div 
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center justify-center text-emerald-300 relative z-10 shrink-0">
                      <UserCheck size={22} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('org.totalServed')}</span>
                      <span className="block text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">{realTotalServed}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center text-amber-300 relative z-10 shrink-0">
                      <Clock size={22} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('org.avgWaitTime')}</span>
                      <span className="block text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-0.5">{avgWaitTimeFormatted} {t('patient.mins')}</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={fadeScrollVariants}
                    className="glass-acrylic-card rounded-[22px] sm:rounded-[32px] p-4 sm:p-6 flex items-center gap-3.5 sm:gap-4 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute -top-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-rose-500/20 border border-rose-400/40 rounded-2xl flex items-center justify-center text-rose-300 relative z-10 shrink-0">
                      <AlertTriangle size={22} />
                    </div>
                    <div className="relative z-10">
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{t('org.autoSkippedPatients')}</span>
                      <span className="block text-2xl sm:text-3xl font-black font-mono text-rose-400 mt-0.5">{realTotalSkipped}</span>
                    </div>
                  </motion.div>
                </div>

                {/* 3. Dynamic visual representation of peak hour load */}
                <motion.div 
                  custom={5}
                  initial="hidden"
                  animate="visible"
                  variants={fadeScrollVariants}
                  className="glass-acrylic-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-2xl"
                >
                  <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6 relative z-10">
                    <h3 className="text-base sm:text-lg font-black flex items-center gap-2 text-white drop-shadow-sm">
                      <BarChart3 size={19} className="text-amber-400 shrink-0" />
                      <span>{t('org.peakHoursTitle')}</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15">
                      {totalInflowCount} {totalInflowCount === 1 ? 'patient' : 'patients'} tracked today
                    </span>
                  </div>

                  <div className="space-y-4 sm:space-y-5 relative z-10">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-bold">
                        <span>{t('org.morningSlot')}</span>
                        <span className="font-mono text-amber-400">
                          {morningPct}% {morningTokens.length > 0 ? `(${morningTokens.length} ${t('org.patientsLabel')})` : ''} {t('org.peakVolume')}
                        </span>
                      </div>
                      <div className="w-full h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#e57342] to-[#ff9655] transition-all duration-700" 
                          style={{ width: `${Math.max(4, morningPct)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-bold">
                        <span>{t('org.afternoonSlot')}</span>
                        <span className="font-mono text-amber-300">
                          {afternoonPct}% {afternoonTokens.length > 0 ? `(${afternoonTokens.length} ${t('org.patientsLabel')})` : ''} {t('org.normalVolume')}
                        </span>
                      </div>
                      <div className="w-full h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#e57342] to-[#ff9655] transition-all duration-700" 
                          style={{ width: `${Math.max(4, afternoonPct)}%` }} 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-bold">
                        <span>{t('org.eveningSlot')}</span>
                        <span className="font-mono text-emerald-400">
                          {eveningPct}% {eveningTokens.length > 0 ? `(${eveningTokens.length} ${t('org.patientsLabel')})` : ''} {t('org.normalVolume')}
                        </span>
                      </div>
                      <div className="w-full h-2.5 sm:h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#e57342] to-[#ff9655] transition-all duration-700" 
                          style={{ width: `${Math.max(4, eveningPct)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            )}
          </>
        )}

      </main>

      {/* Floating Pill-Shaped Footer */}
      <footer className="mt-12 sm:mt-16 px-4 flex justify-center relative z-20 pb-6">
        <div className="glass-acrylic-pill px-6 sm:px-8 py-3.5 rounded-full border border-white/20 bg-[#162d3a]/75 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 max-w-4xl w-full text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide">{t('footer.brand')}</span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="text-[11px] text-slate-300 hidden sm:inline">{t('footer.liveSync')}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="glass-acrylic-pill px-2.5 py-1 rounded-full text-[10px] text-amber-300 border border-amber-300/30 font-mono">
              {t('footer.encryptedBadge')}
            </span>
            <span>© {new Date().getFullYear()} {t('footer.allRights')}</span>
          </div>
        </div>
      </footer>

      {/* QR Token Scanner / Verifier Modal */}
      <AnimatePresence>
        {qrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs sm:max-w-md rounded-[26px] sm:rounded-[32px] glass-acrylic-card p-4 sm:p-6 border border-white/30 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-center pb-3 border-b border-white/15 mb-3.5 sm:mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-amber-400" />
                  <span className="text-sm font-black text-white">{t('org.qrScannerTitle')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQrModalOpen(false);
                    setVerifiedTokenResult(null);
                    setQrScanInput('');
                  }}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleVerifyQr} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-1.5 px-1">
                    {t('org.qrScannerLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('org.qrScannerPlaceholder')}
                    value={qrScanInput}
                    onChange={(e) => setQrScanInput(e.target.value)}
                    className="w-full glass-input rounded-2xl px-4 py-2.5 text-xs text-white font-mono font-bold outline-none focus:border-amber-400 shadow-md transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#e57342] to-[#ff9655] text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-lg hover:brightness-110 transition-all"
                >
                  {t('org.verifyTokenNow')}
                </button>
              </form>

              {/* Verified result box */}
              {verifiedTokenResult && (
                <div className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-left space-y-1.5 sm:space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-white">{verifiedTokenResult.token.patientName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-mono">
                      Token #{verifiedTokenResult.token.tokenNumber}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200">
                    <p>{t('org.tabDepartments')}: <strong>{verifiedTokenResult.deptName}</strong></p>
                    <p>{t('org.phone')}: <strong>{verifiedTokenResult.token.patientPhone}</strong></p>
                    <p>{t('org.status')}: <span className="capitalize font-bold text-emerald-300">{verifiedTokenResult.token.status}</span></p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multilingual Clinic Operations Assistant Chatbot (Strictly isolated to this clinic) */}
      <TriageChatbot
        mode="clinic"
        departments={departments}
        liveQueue={liveQueue}
        supplies={supplies}
        reports={reports}
        forecast={forecast}
        clinicName={currentUser?.hospitalName || 'Clinic'}
      />

      {/* Premium Bilingual Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={async () => {
          setShowSignOutModal(false);
          await logout();
        }}
      />
    </div>
  );
};

export default OrgDashboard;
