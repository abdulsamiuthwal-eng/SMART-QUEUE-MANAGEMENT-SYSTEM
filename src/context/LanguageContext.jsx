import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    common: {
      appName: 'Smart Queue',
      language: 'Urdu',
      logout: 'Logout',
      loading: 'Loading...',
      submitting: 'Submitting...',
      success: 'Success',
      error: 'Error',
      home: 'Home',
    },
    splash: {
      tagline: 'Modern Queue Management System',
      loading: 'Initializing real-time connection...',
      connecting: 'Syncing live tokens & queue status...',
    },
    signOutModal: {
      badge: 'Security & Session',
      title: 'Confirm Sign Out',
      message: 'Are you sure you want to sign out?',
      submessage: 'You will return to the login screen. Any active tickets, tokens, and appointments remain safely preserved in the system.',
      confirm: 'Yes, Sign Out',
      cancel: 'Cancel / Stay',
    },
    welcome: {
      badge: 'Smart Healthcare Flow',
      title: 'Smart Queue',
      subtitle: 'Calm, intelligent digital patient flow management for modern healthcare clinics & hospitals.',
      getStarted: 'Get Started',
      zeroDelay: 'Zero Delay',
      liveTokens: 'Live Tokens',
      encrypted: 'Encrypted',
    },
    login: {
      title: 'Login',
      encryptedHealthPortal: 'Encrypted Health Portal',
      home: 'Home',
      appName: 'Smart Queue',
      brandFlow: 'Smart Healthcare Flow',
      realTimeBadge: 'Real-Time Queue Management',
      heading: 'Calm & Intelligent Patient Routing',
      desc: 'Minimize waiting stress with real-time digital token calling, estimated times, and live department tracking.',
      instantTokens: 'Instant Tokens',
      liveETAs: 'Live ETAs',
      encryptedSystem: 'Encrypted System',
      systemFooter: 'Smart Queue Management System',
      email: 'Email Address',
      emailPlaceholder: 'Enter email address',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      forgotPassword: 'Forgot Password?',
      button: 'Login',
      googleBtn: 'Continue with Google',
      noAccount: "Don't have an account?",
      registerHere: 'Register here',
      quickDemoFill: 'Quick Demo Fill',
      patient: 'Patient',
      clinic: 'Hospital / Clinic',
      invalidCreds: 'Invalid email or password.',
      loginSuccess: 'Logged in successfully!',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      forgotPassword: 'Forgot Password?',
      email: 'Email Address',
      password: 'Password',
      googleBtn: 'Continue with Google',
      googleSignIn: 'Continue with Google',
      dontHaveAccount: "Don't have an account?",
      noAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      registerHere: 'Register here',
      loginHere: 'Login here',
      resetEmailSent: 'Password reset link sent to your email!',
      resetBtn: 'Send Reset Link',
      backToLogin: 'Back to Login',
      invalidCreds: 'Invalid email or password.',
      loginSuccess: 'Logged in successfully!',
      patientPortal: 'Patient Portal',
      clinicPortal: 'Clinic Portal',
      quickDemoFill: 'Quick Demo Fill',
      patient: 'Patient',
      clinic: 'Hospital / Clinic',
      encryptedHealthPortal: 'Encrypted Health Portal',
      calmIntelligentRouting: 'Calm & Intelligent Patient Routing',
      routingDesc: 'Minimize waiting stress with real-time digital token calling, estimated times, and live department tracking.',
      instantTokens: 'Instant Tokens',
      liveETAs: 'Live ETAs',
      encryptedSystem: 'Encrypted System',
      home: 'Home',
      smartHealthcareFlow: 'Smart Healthcare Flow',
    },
    register: {
      title: 'Create Account',
      badge: 'Live Patient & Clinic Registration',
      patientTab: 'Patient',
      orgTab: 'Hospital / Clinic',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter full name',
      email: 'Email Address',
      emailPlaceholder: 'Enter email address',
      phone: 'Phone Number',
      phonePlaceholder: 'Enter phone number',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      hospitalName: 'Hospital / Clinic Name',
      hospitalNamePlaceholder: 'Enter hospital or clinic name',
      address: 'Address / Location',
      addressPlaceholder: 'Enter clinic location / address',
      registerBtn: 'Register Account',
      backToLogin: 'Back to Login',
      alreadyHaveAccount: 'Already have an account?',
      loginHere: 'Login here',
      successPatient: 'Account created successfully! Redirecting to login...',
      successOrg: 'Clinic account created successfully! Redirecting to login...',
      emailInUse: 'This email is already registered. Please login or use a different email.',
    },
    forgotPassword: {
      title: 'Reset Password',
      badge: 'Direct Account Security',
      instructions: 'Enter your registered email address and your new password to update your account.',
      email: 'Registered Email Address',
      emailPlaceholder: 'Enter your registered email',
      newPassword: 'New Password',
      newPasswordPlaceholder: 'Enter your new password',
      sendBtn: 'Update Password & Continue to Login',
      backToLogin: 'Back to Login',
      successMsg: 'Password updated successfully! Redirecting to login...',
      userNotFound: 'No account found with this email. Please check and try again.',
    },
    patient: {
      dashboard: 'Patient Dashboard',
      welcome: 'Welcome back,',
      bookToken: 'Book Token',
      walkIn: 'Walk-In',
      appointment: 'Scheduled Appointment',
      selectDept: 'Select Department',
      selectDoc: 'Select Doctor (Optional)',
      appointmentTime: 'Preferred Time (for Appointment)',
      confirmBooking: 'Confirm Token Booking',
      liveQueue: 'Live Queue Status',
      activeToken: 'Your Active Token',
      servingToken: 'Currently Serving',
      yourPosition: 'Your Queue Position',
      estWait: 'Estimated Wait Time',
      mins: 'mins',
      reschedule: 'Reschedule Token',
      cancelToken: 'Cancel Token',
      notifications: 'Real-time Notifications',
      noNotifications: 'No new notifications',
      feedback: 'Submit Feedback',
      rating: 'Rate your experience',
      comments: 'Share comments or suggestions...',
      submitFeedback: 'Submit Feedback',
      feedbackSuccess: 'Thank you for your feedback!',
      noActiveToken: 'You do not have any active token right now.',
      rescheduleSuccess: 'Token rescheduled successfully!',
      cancelSuccess: 'Token cancelled successfully!',
      tokenBooked: 'Token booked successfully! Your Token is ',
    },
    org: {
      dashboard: 'Clinic Dashboard',
      welcome: 'Clinic Portal -',
      liveQueueMgmt: 'Live Queue Manager',
      callNext: 'Call Next Patient',
      skipNoShow: 'Skip No-Show',
      manualToken: 'Manual Token Generator',
      patientName: 'Patient Name',
      phone: 'Phone Number',
      selectDept: 'Select Department',
      generateToken: 'Generate Token',
      deptLoad: 'Department Load Indicators',
      viewReports: 'View Analytics & Reports',
      manageDepts: 'Manage Departments',
      addDept: 'Add New Department',
      deptName: 'Department Name',
      avgServiceTime: 'Avg Service Time (mins)',
      loadLow: 'Low Load',
      loadMedium: 'Medium Load',
      loadHigh: 'High Load',
      totalServed: 'Total Served Today',
      avgWaitTime: 'Avg Patient Wait Time',
      peakHours: 'Peak Hours Summary',
      queueStatus: 'Queue status updated successfully!',
      patientCalled: 'Next patient called!',
      patientSkipped: 'Patient skipped (no-show).',
      deptAdded: 'Department added successfully!',
      deptDeleted: 'Department removed.',
      actions: 'Actions',
      status: 'Status',
      waiting: 'Waiting',
      serving: 'Serving',
      completed: 'Completed',
      skipped: 'Skipped',
    }
  },
  ur: {
    common: {
      appName: 'اسمارٹ قطار',
      language: 'English',
      logout: 'لاگ آؤٹ',
      loading: 'لوڈنگ ہو رہی ہے...',
      submitting: 'جمع کروایا جا رہا ہے...',
      success: 'کامیابی',
      error: 'غلطی',
      home: 'ہوم پیج',
    },
    splash: {
      tagline: 'جدید ترین ڈیجیٹل قطار مینیجمنٹ سسٹم',
      loading: 'لائیو سسٹم سے رابطہ قائم کیا جا رہا ہے...',
      connecting: 'لائیو ٹوکن ڈیٹا ہم آہنگ ہو رہا ہے...',
    },
    signOutModal: {
      badge: 'سیشن مینیجمنٹ',
      title: 'لاگ آؤٹ کی تصدیق',
      message: 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟',
      submessage: 'آپ دوبارہ لاگ ان اسکرین پر چلے جائیں گے۔ آپ کے تمام فعال ٹوکنز اور تاریخ محفوظ رہے گی۔',
      confirm: 'جی ہاں، لاگ آؤٹ کریں',
      cancel: 'منسوخ کریں (ڈیش بورڈ پر رہیں)',
    },
    welcome: {
      badge: 'سمارٹ ہیلتھ کیئر فلو',
      title: 'اسمارٹ قطار',
      subtitle: 'جدید کلینکس اور ہسپتالوں کے لیے پرسکون، تیز اور منظم ڈیجیٹل قطار مینیجمنٹ نظام۔',
      getStarted: 'شروع کریں',
      zeroDelay: 'فوری سروس',
      liveTokens: 'لائیو ٹوکنز',
      encrypted: 'محفوظ نظام',
    },
    login: {
      title: 'لاگ ان',
      encryptedHealthPortal: 'محفوظ طبی پورٹل',
      home: 'ہوم پیج',
      appName: 'اسمارٹ قطار',
      brandFlow: 'سمارٹ ہیلتھ کیئر فلو',
      realTimeBadge: 'لائیو قطار مینیجمنٹ',
      heading: 'پرسکون اور منظم طبی سہولیات',
      desc: 'لائیو ٹوکن ٹریکنگ، متوقع انتظار کے وقت اور فوری ڈیجیٹل کالنگ کے ساتھ ہسپتال کے وقت کو آسان اور پرسکون بنائیں۔',
      instantTokens: 'فوری ٹوکن',
      liveETAs: 'لائیو اوقات',
      encryptedSystem: 'محفوظ نظام',
      systemFooter: 'اسمارٹ قطار مینیجمنٹ سسٹم',
      email: 'ای میل ایڈریس',
      emailPlaceholder: 'اپنا ای میل درج کریں',
      password: 'پاس ورڈ',
      passwordPlaceholder: 'اپنا پاس ورڈ درج کریں',
      forgotPassword: 'پاس ورڈ بھول گئے؟',
      button: 'لاگ ان کریں',
      googleBtn: 'گوگل کے ساتھ جاری رکھیں',
      noAccount: 'کیا آپ کا اکاؤنٹ نہیں ہے؟',
      registerHere: 'نیا اکاؤنٹ بنائیں',
      quickDemoFill: 'ڈیمو فوری لاگ ان',
      patient: 'مریض',
      clinic: 'ہسپتال / کلینک',
      invalidCreds: 'غلط ای میل یا پاس ورڈ درج کیا گیا ہے۔',
      loginSuccess: 'لاگ ان کامیاب رہا!',
    },
    auth: {
      login: 'لاگ ان کریں',
      register: 'رجسٹر کریں',
      forgotPassword: 'پاس ورڈ بھول گئے؟',
      email: 'ای میل ایڈریس',
      password: 'پاس ورڈ',
      googleBtn: 'گوگل کے ساتھ جاری رکھیں',
      googleSignIn: 'گوگل کے ساتھ جاری رکھیں',
      dontHaveAccount: 'کیا آپ کا اکاؤنٹ نہیں ہے؟',
      noAccount: 'کیا آپ کا اکاؤنٹ نہیں ہے؟',
      alreadyHaveAccount: 'پہلے سے اکاؤنٹ موجود ہے؟',
      registerHere: 'یہاں رجسٹر کریں',
      loginHere: 'یہاں لاگ ان کریں',
      resetEmailSent: 'پاس ورڈ دوبارہ ترتیب دینے کا لنک ای میل کر دیا گیا ہے!',
      resetBtn: 'ری سیٹ لنک بھیجیں',
      backToLogin: 'لاگ ان پر واپس جائیں',
      invalidCreds: 'غلط ای میل یا پاس ورڈ درج کیا گیا ہے۔',
      loginSuccess: 'لاگ ان کامیاب رہا!',
      patientPortal: 'مریض پورٹل',
      clinicPortal: 'کلینک پورٹل',
      quickDemoFill: 'ڈیمو فوری لاگ ان',
      patient: 'مریض',
      clinic: 'ہسپتال / کلینک',
      encryptedHealthPortal: 'محفوظ طبی پورٹل',
      calmIntelligentRouting: 'پرسکون اور منظم طبی سہولیات',
      routingDesc: 'لائیو ٹوکن ٹریکنگ اور انتظار کے متوقع وقت کے ساتھ طبی معائنے کو آسان اور پرسکون بنائیں۔',
      instantTokens: 'فوری ٹوکن',
      liveETAs: 'لائیو اوقات',
      encryptedSystem: 'محفوظ نظام',
      home: 'ہوم پیج',
      smartHealthcareFlow: 'سمارٹ ہیلتھ کیئر فلو',
    },
    register: {
      title: 'نیا اکاؤنٹ بنائیں',
      badge: 'لائیو مریض اور کلینک رجسٹریشن پورٹل',
      patientTab: 'مریض',
      orgTab: 'ہسپتال / کلینک',
      fullName: 'پورا نام',
      fullNamePlaceholder: 'اپنا مکمل نام درج کریں',
      email: 'ای میل ایڈریس',
      emailPlaceholder: 'اپنا ای میل درج کریں',
      phone: 'فون نمبر',
      phonePlaceholder: 'اپنا فون نمبر درج کریں',
      password: 'پاس ورڈ',
      passwordPlaceholder: 'محفوظ پاس ورڈ درج کریں',
      hospitalName: 'ہسپتال یا کلینک کا نام',
      hospitalNamePlaceholder: 'ہسپتال یا کلینک کا نام درج کریں',
      address: 'پتہ یا مقام',
      addressPlaceholder: 'کلینک کا پتہ درج کریں',
      registerBtn: 'اکاؤنٹ بنائیں',
      backToLogin: 'لاگ ان پر واپس',
      alreadyHaveAccount: 'پہلے سے اکاؤنٹ موجود ہے؟',
      loginHere: 'یہاں لاگ ان کریں',
      successPatient: 'اکاؤنٹ کامیابی سے بن گیا! لاگ ان پیج پر بھیجا جا رہا ہے...',
      successOrg: 'کلینک کا اکاؤنٹ بن گیا! لاگ ان پیج پر بھیجا جا رہا ہے...',
      emailInUse: 'یہ ای میل پہلے سے رجسٹرڈ ہے۔ براہ کرم لاگ ان کریں یا دوسری ای میل درج کریں۔',
    },
    forgotPassword: {
      title: 'پاس ورڈ تبدیل کریں',
      badge: 'محفوظ اکاؤنٹ بحالی',
      instructions: 'اپنا رجسٹرڈ ای میل ایڈریس اور نیا پاس ورڈ درج کریں تاکہ آپ کے اکاؤنٹ کا پاس ورڈ تبدیل ہو سکے۔',
      email: 'رجسٹرڈ ای میل ایڈریس',
      emailPlaceholder: 'اپنا رجسٹرڈ ای میل درج کریں',
      newPassword: 'نیا پاس ورڈ',
      newPasswordPlaceholder: 'اپنا نیا پاس ورڈ درج کریں',
      sendBtn: 'پاس ورڈ تبدیل کر کے لاگ ان پر جائیں',
      backToLogin: 'لاگ ان پر واپس',
      successMsg: 'پاس ورڈ کامیابی سے تبدیل ہو گیا! لاگ ان پیج پر منتقل کیا جا رہا ہے...',
      userNotFound: 'اس ای میل سے کوئی اکاؤنٹ موجود نہیں ہے۔ براہ کرم دوبارہ چیک کریں۔',
    },
    patient: {
      dashboard: 'مریض کا ڈیش بورڈ',
      welcome: 'خوش آمدید،',
      bookToken: 'ٹوکن حاصل کریں',
      walkIn: 'عام وزٹ (واک ان)',
      appointment: 'پہلے سے طے شدہ ملاقات',
      selectDept: 'شعبہ منتخب کریں',
      selectDoc: 'ڈاکٹر منتخب کریں (اختیاری)',
      appointmentTime: 'پسندیدہ وقت (ملاقات کے لیے)',
      confirmBooking: 'ٹوکن بکنگ کی تصدیق کریں',
      liveQueue: 'قطار کی تازہ ترین صورتحال',
      activeToken: 'آپ کا فعال ٹوکن',
      servingToken: 'زیر معائنہ ٹوکن',
      yourPosition: 'آپ کا نمبر',
      estWait: 'انتظار کا متوقع وقت',
      mins: 'منٹ',
      reschedule: 'ٹوکن کا وقت بدلیں',
      cancelToken: 'ٹوکن منسوخ کریں',
      notifications: 'حالیہ اطلاعات',
      noNotifications: 'کوئی نئی اطلاع نہیں ہے',
      feedback: 'فیڈ بیک فارم',
      rating: 'اپنے تجربے کی درجہ بندی کریں',
      comments: 'اپنی رائے یا تجاویز لکھیں...',
      submitFeedback: 'رائے جمع کروائیں',
      feedbackSuccess: 'آپ کی رائے کا بہت شکریہ!',
      noActiveToken: 'آپ کا کوئی فعال ٹوکن نہیں ہے۔',
      rescheduleSuccess: 'ٹوکن کا وقت کامیابی سے تبدیل ہو گیا ہے!',
      cancelSuccess: 'ٹوکن منسوخ کر دیا گیا ہے!',
      tokenBooked: 'ٹوکن بک ہو گیا ہے! آپ کا ٹوکن نمبر ہے ',
    },
    org: {
      dashboard: 'کلینک کا ڈیش بورڈ',
      welcome: 'کلینک پورٹل -',
      liveQueueMgmt: 'قطار کا انتظام',
      callNext: 'اگلے مریض کو بلائیں',
      skipNoShow: 'غیر حاضر کو چھوڑیں',
      manualToken: 'دستی ٹوکن کا اجراء',
      patientName: 'مریض کا نام',
      phone: 'فون نمبر',
      selectDept: 'شعبہ منتخب کریں',
      generateToken: 'ٹوکن بنائیں',
      deptLoad: 'شعبہ جات پر رش کی صورتحال',
      viewReports: 'رپورٹس اور تجزیہ',
      manageDepts: 'شعبہ جات کا انتظام',
      addDept: 'نیا شعبہ شامل کریں',
      deptName: 'شعبہ کا نام',
      avgServiceTime: 'اوسط معائنہ کا وقت (منٹ)',
      loadLow: 'کم رش',
      loadMedium: 'درمیانہ رش',
      loadHigh: 'زیادہ رش',
      totalServed: 'آج کل مریضوں کی تعداد',
      avgWaitTime: 'مریضوں کا اوسط انتظار کا وقت',
      peakHours: 'سب سے زیادہ رش کے اوقات',
      queueStatus: 'قطار کی صورتحال اپ ڈیٹ کر دی گئی ہے!',
      patientCalled: 'اگلے مریض کو آواز دی گئی ہے!',
      patientSkipped: 'مریض کو غیر حاضر قرار دے کر چھوڑ دیا گیا ہے۔',
      deptAdded: 'نیا شعبہ کامیابی سے شامل ہو گیا ہے!',
      deptDeleted: 'شعبہ ختم کر دیا گیا ہے۔',
      actions: 'کارروائی',
      status: 'حالت',
      waiting: 'انتظار میں',
      serving: 'زیر معائنہ',
      completed: 'مکمل',
      skipped: 'چھوڑ دیا',
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('queue_lang') || 'en';
  });

  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'ur' : 'en';
    setLocale(nextLocale);
    localStorage.setItem('queue_lang', nextLocale);
  };

  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let value = translations[locale];
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        // Fallback to English if translation is missing in current locale
        let fallback = translations.en;
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            return keyPath;
          }
        }
        return fallback;
      }
    }
    return value;
  };

  // Synchronize document attributes safely without breaking viewport horizontal slider coordinates
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('data-locale', locale);
    
    // Crucial: Keep documentElement.dir as 'ltr' so absolute/sliding viewport coordinates
    // (e.g. 200vw stage track, translate3d(-100vw, 0, 0)) never shift or push cards off-screen.
    // RTL direction is cleanly applied to individual cards/sections via dir={locale === 'ur' ? 'rtl' : 'ltr'}.
    document.documentElement.dir = 'ltr';

    if (locale === 'ur') {
      document.documentElement.classList.add('lang-ur');
      document.body.classList.add('lang-ur');
    } else {
      document.documentElement.classList.remove('lang-ur');
      document.body.classList.remove('lang-ur');
    }
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
