import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, ArrowLeft, Loader2, AlertCircle, ShieldCheck, CheckCircle2, RefreshCw, UserCheck, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import trekLogo from '../assets/trek-logo.webp';

export interface AuthUserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  email_verified?: boolean;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUserData) => void;
  currentUser?: AuthUserData | null;
  onSignOut?: () => void;
  promptMessage?: string;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onSignOut,
  promptMessage,
  initialTab
}) => {
  const { language, t, formatNumber } = useLanguage();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab || 'login');

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [registerStep, setRegisterStep] = useState<'details' | 'verify'>('details');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [previewCode, setPreviewCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clean state reset function
  const resetFormState = () => {
    setTab('login');
    setRegisterStep('details');
    setVerificationCode('');
    setPreviewCode('');
    setPassword('');
    setEmail('');
    setName('');
    setErrorMessage('');
    setSuccessMessage('');
    setResendTimer(0);
    setLoading(false);
    setResending(false);
  };

  const handleClose = () => {
    resetFormState();
    onClose();
  };

  // Reset form whenever modal closes or opens
  useEffect(() => {
    if (!isOpen) {
      resetFormState();
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Countdown timer for resending code
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  if (!isOpen) return null;

  // Handle Requesting Verification Code
  const handleSendVerificationCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা প্রদান করুন।'
          : language === 'ar'
          ? 'يرجى إدخال عنوان بريدك الإلكتروني.'
          : 'Please enter your email address.'
      );
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।'
          : language === 'ar'
          ? 'يرجى إدخال عنوان بريد إلكتروني صحيح.'
          : 'Please enter a valid email address.'
      );
      return;
    }
    if (!cleanPass) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি নিরাপদ পাসওয়ার্ড প্রদান করুন।'
          : language === 'ar'
          ? 'يرجى إدخال كلمة مرور آمنة.'
          : 'Please enter a secure password.'
      );
      return;
    }
    if (cleanPass.length < 6) {
      setErrorMessage(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
          : language === 'ar'
          ? 'يجب أن تتكون كلمة المرور من ٦ أحرف على الأقل.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setLoading(true);
    try {
      if (currentUser?.email) {
        setErrorMessage(
          language === 'bn'
            ? `আপনি ইতিমধ্যে (${currentUser.email}) অ্যাকাউন্টে লগইন আছেন। একই সাথে অন্য একাউন্ট তৈরি করা যাবে না। প্রথমে লগআউট করুন।`
            : language === 'ar'
            ? `أنت مسجل الدخول بالفعل بحساب (${currentUser.email}). لا يمكنك تسجيل حساب آخر في نفس الوقت. يرجى تسجيل الخروج أولاً.`
            : `You are already logged into an account (${currentUser.email}). You cannot register another account at the same time. Please log out first.`
        );
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: cleanName, currentLoggedInEmail: currentUser?.email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisterStep('verify');
        setResendTimer(60);
        setPreviewCode(data.previewCode || '');
        setSuccessMessage(
          data.message ||
            (language === 'bn'
              ? `${cleanEmail} ঠিকানায় ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে।`
              : language === 'ar'
              ? `تم إرسال رمز تحقق مكوّن من ٦ أرقام إلى ${cleanEmail}.`
              : `A 6-digit verification code was sent to ${cleanEmail}.`)
        );
      } else {
        setErrorMessage(
          data.error ||
            (language === 'bn'
              ? 'ভেরিফিকেশন কোড পাঠাতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
              : language === 'ar'
              ? 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.'
              : 'Failed to send verification code. Please try again.')
        );
      }
    } catch {
      setErrorMessage(
        language === 'bn'
          ? 'ডাটাবেজ সার্ভারের সাথে যোগাযোগে নেটওয়ার্ক ত্রুটি হয়েছে।'
          : language === 'ar'
          ? 'خطأ في الشبكة أثناء الاتصال بالخادم.'
          : 'Network error connecting to database server.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Resending Code
  const handleResendCode = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendTimer(60);
        setPreviewCode(data.previewCode || '');
        setSuccessMessage(
          data.message ||
            (language === 'bn'
              ? 'একটি নতুন ভেরিফিকেশন কোড পাঠানো হয়েছে।'
              : language === 'ar'
              ? 'تم إنشاء رمز تحقق جديد وإرساله بنجاح.'
              : 'A fresh verification code has been generated and sent.')
        );
      } else {
        setErrorMessage(
          data.error ||
            (language === 'bn'
              ? 'কোড পুনরায় পাঠাতে ব্যর্থ হয়েছে।'
              : language === 'ar'
              ? 'فشل إعادة إرسال الرمز.'
              : 'Failed to resend code.')
        );
      }
    } catch {
      setErrorMessage(
        language === 'bn'
          ? 'ভেরিফিকেশন কোড পুনরায় পাঠাতে নেটওয়ার্ক ত্রুটি হয়েছে।'
          : language === 'ar'
          ? 'خطأ في الشبكة أثناء إعادة إرسال رمز التحقق.'
          : 'Network error resending verification code.'
      );
    } finally {
      setResending(false);
    }
  };

  // Handle Verification & Final Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanCode = verificationCode.trim();
    if (!cleanCode) {
      setErrorMessage(
        language === 'bn'
          ? 'অনুগ্রহ করে ৬-সংখ্যার ভেরিফিকেশন কোডটি দিন।'
          : language === 'ar'
          ? 'يرجى إدخال رمز التحقق المكون من ٦ أرقام.'
          : 'Please enter the 6-digit verification code.'
      );
      return;
    }
    if (cleanCode.length !== 6) {
      setErrorMessage(
        language === 'bn'
          ? 'ভেরিফিকেশন কোডটি অবশ্যই ঠিক ৬ সংখ্যার হতে হবে।'
          : language === 'ar'
          ? 'يجب أن يتكون رمز التحقق من ٦ أرقام بالضبط.'
          : 'The verification code must be exactly 6 digits.'
      );
      return;
    }

    setLoading(true);
    try {
      if (currentUser?.email) {
        setErrorMessage(
          language === 'bn'
            ? `আপনি ইতিমধ্যে (${currentUser.email}) অ্যাকাউন্টে লগইন আছেন। একই সাথে অন্য একাউন্ট তৈরি করা যাবে না। প্রথমে লগআউট করুন।`
            : language === 'ar'
            ? `أنت مسجل الدخول بالفعل بحساب (${currentUser.email}). لا يمكنك تسجيل حساب آخر في نفس الوقت. يرجى تسجيل الخروج أولاً.`
            : `You are already logged into an account (${currentUser.email}). You cannot register another account at the same time. Please log out first.`
        );
        setLoading(false);
        return;
      }

      const chatSessionId = localStorage.getItem('trek_guest_session') || undefined;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          verificationCode: cleanCode,
          currentLoggedInEmail: currentUser?.email,
          sessionId: chatSessionId
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const verifiedUser = data.user;
        try { localStorage.removeItem('trek_guest_session'); } catch {}
        handleClose();
        onSuccess(verifiedUser);
      } else {
        setErrorMessage(
          data.error ||
            (language === 'bn'
              ? 'ভেরিফিকেশন ব্যর্থ হয়েছে। কোড যাচাই করে আবার চেষ্টা করুন।'
              : language === 'ar'
              ? 'فشل التحقق. يرجى مراجعة الرمز والمحاولة مرة أخرى.'
              : 'Verification failed. Please check the code and try again.')
        );
      }
    } catch {
      setErrorMessage(
        language === 'bn'
          ? 'অ্যাকাউন্ট তৈরিতে নেটওয়ার্ক ত্রুটি হয়েছে।'
          : language === 'ar'
          ? 'خطأ في الشبكة أثناء إتمام إنشاء الحساب.'
          : 'Network error finalizing account creation.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Normal Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (currentUser?.email) {
        setErrorMessage(
          language === 'bn'
            ? `আপনি ইতিমধ্যে (${currentUser.email}) অ্যাকাউন্টে লগইন আছেন। একই সাথে অন্য একাউন্টে লগইন করা যাবে না। প্রথমে লগআউট করুন।`
            : language === 'ar'
            ? `أنت مسجل الدخول بالفعل بحساب (${currentUser.email}). لا يمكنك تسجيل الدخول إلى حساب آخر في نفس الوقت. يرجى تسجيل الخروج أولاً.`
            : `You are already logged into an account (${currentUser.email}). You cannot log into another account at the same time. Please log out first.`
        );
        setLoading(false);
        return;
      }

      const chatSessionId = localStorage.getItem('trek_guest_session') || undefined;
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          currentLoggedInEmail: currentUser?.email,
          sessionId: chatSessionId
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const loggedUser = data.user;
        try { localStorage.removeItem('trek_guest_session'); } catch {}
        handleClose();
        onSuccess(loggedUser);
      } else {
        setErrorMessage(
          data.error ||
            (language === 'bn'
              ? 'ভুল তথ্য দিয়েছেন। আপনার ইমেইল ও পাসওয়ার্ড যাচাই করুন।'
              : language === 'ar'
              ? 'بيانات الدخول غير صحيحة. يرجى التحقق من بريدك الإلكتروني وكلمة المرور.'
              : 'Invalid credentials. Please check your email and password.')
        );
      }
    } catch {
      setErrorMessage(
        language === 'bn'
          ? 'ডাটাবেজ সার্ভারের সাথে যোগাযোগে নেটওয়ার্ক ত্রুটি হয়েছে।'
          : language === 'ar'
          ? 'خطأ في الشبكة أثناء الاتصال بالخادم.'
          : 'Network error connecting to database server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl p-5 sm:p-8 text-slate-800">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser?.email ? (
          <div className="text-center py-2" id="auth-active-session-view">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-teal-600 mb-4 shadow-sm">
              <UserCheck className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-heading tracking-tight">
              {language === 'bn' ? 'ইতিমধ্যেই লগইন আছেন' : language === 'ar' ? 'أنت مسجل الدخول بالفعل' : 'Already Logged In'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {language === 'bn'
                ? 'আপনি বর্তমানে একটি অ্যাকাউন্টে লগইন আছেন। একই সময়ে অন্য অ্যাকাউন্টে লগইন করা যাবে না।'
                : language === 'ar'
                ? 'أنت مسجل الدخول حالياً بحساب نشط. لا يمكنك تسجيل الدخول إلى حساب آخر في نفس الوقت.'
                : 'You are currently logged into an account. You cannot log into another account at the same time.'}
            </p>

            {/* Active Account Card */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-left rtl:text-right flex items-center gap-3.5">
              <div className="relative shrink-0">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-base">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" title={language === 'bn' ? 'সক্রিয় সেশন' : language === 'ar' ? 'جلسة نشطة' : 'Active session'} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {currentUser.name}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                    {currentUser.role || (language === 'bn' ? 'সদস্য' : language === 'ar' ? 'عضو' : 'Member')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-600">
                    {language === 'bn' ? 'সক্রিয় সেশন' : language === 'ar' ? 'جلسة نشطة' : 'Active session'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-800 text-xs flex items-start gap-2 text-left rtl:text-right">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                {language === 'bn' ? (
                  <>অন্য অ্যাকাউন্টে লগইন বা নতুন প্রোফাইল তৈরি করতে, প্রথমে <strong>{currentUser.name}</strong> থেকে লগআউট করতে হবে।</>
                ) : language === 'ar' ? (
                  <>لتسجيل الدخول إلى حساب آخر أو إنشاء ملف تعريف جديد، يجب تسجيل الخروج من <strong>{currentUser.name}</strong> أولاً.</>
                ) : (
                  <>To sign into a different account or create a new profile, you must log out of <strong>{currentUser.name}</strong> first.</>
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                id="btn-auth-switch-signout"
                onClick={() => {
                  if (onSignOut) {
                    onSignOut();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'bn' ? 'বর্তমান অ্যাকাউন্ট থেকে লগআউট করুন' : language === 'ar' ? 'تسجيل الخروج من الحساب الحالي' : 'Log Out of Current Account'}</span>
              </button>

              <button
                type="button"
                id="btn-auth-continue-session"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs shadow-md shadow-teal-500/20 transition-colors cursor-pointer"
              >
                {language === 'bn' ? `${currentUser.name} হিসেবে এগিয়ে যান` : language === 'ar' ? `المتابعة كـ ${currentUser.name}` : `Continue as ${currentUser.name}`}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Prompt Notice Banner if triggered by gated action */}
            {promptMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/25 backdrop-blur-md flex items-start gap-3 text-slate-800 text-xs shadow-xs">
                <div className="p-1.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-sm mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-teal-950 font-heading tracking-tight text-xs sm:text-sm">
                    {language === 'bn' ? 'লগইন প্রয়োজন' : language === 'ar' ? 'مطلوب تسجيل الدخول' : 'Account Required'}
                  </p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                    {promptMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Brand Logo Header */}
            <div className="flex justify-center mb-5">
              <img
                src={trekLogo}
                alt="Trek Consultancy"
                className="h-11 w-auto object-contain"
              />
            </div>

            {/* Tab switch - always accessible */}
            <div className="flex rounded-2xl bg-white/80 p-1 border border-slate-200/80 backdrop-blur-md mb-6">
              <button
                onClick={() => {
                  setTab('login');
                  setRegisterStep('details');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  tab === 'login'
                    ? 'bg-[#00a8b5] text-white shadow-sm shadow-teal-500/25'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'bn' ? 'সাইন ইন' : language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setTab('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  tab === 'register'
                    ? 'bg-[#00a8b5] text-white shadow-sm shadow-teal-500/25'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {registerStep === 'verify'
                  ? (language === 'bn' ? 'ইমেইল ভেরিফিকেশন' : language === 'ar' ? 'التحقق من البريد' : 'Email Verification')
                  : (language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : language === 'ar' ? 'إنشاء حساب' : 'Create Account')}
              </button>
            </div>

            {/* Step: Login */}
            {tab === 'login' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 font-heading tracking-tight">
                    {language === 'bn' ? 'ট্রেক কনসালটেন্সি ফোরামে স্বাগতম' : language === 'ar' ? 'مرحباً بكم مجدداً في منتدى تريك للاستشارات' : 'Welcome Back to Trek Consultancy Forum'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn'
                      ? 'আপনার আলোচনা, উত্তর এবং প্রোফাইলে প্রবেশ করতে সাইন ইন করুন'
                      : language === 'ar'
                      ? 'سجّل الدخول للوصول إلى مناقشاتك وإجاباتك وملفك الشخصي'
                      : 'Sign in to access your discussions, answers, and profile'}
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'ইমেইল ঠিকানা' : language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পাসওয়ার্ড' : language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer mt-2 backdrop-blur-md transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{language === 'bn' ? 'সাইন ইন করে এগিয়ে যান' : language === 'ar' ? 'تسجيل الدخول والمتابعة' : 'Sign In & Continue'}</span>
                        <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step: Register Details */}
            {tab === 'register' && registerStep === 'details' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 font-heading tracking-tight">
                    {language === 'bn' ? 'কমিউনিটিতে যোগ দিন' : language === 'ar' ? 'انضم إلى مجتمعنا' : 'Join the Community'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn'
                      ? 'ইমেইল ভেরিফিকেশন কোড পেতে আপনার তথ্য প্রদান করুন'
                      : language === 'ar'
                      ? 'أدخل بياناتك لاستلام رمز التحقق عبر البريد الإلكتروني'
                      : 'Enter your details to receive an email verification code'}
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSendVerificationCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পুরো নাম' : language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sarah Jenkins"
                        className="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'ইমেইল ঠিকানা' : language === 'ar' ? 'عنوان البريد الإلكتروني' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : language === 'ar' ? 'كلمة المرور (٦ أحرف على الأقل)' : 'Password (min 6 characters)'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-3.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 rtl:pl-3.5 rtl:pr-10 pr-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-slate-900 placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md transition-all active:scale-95"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>{language === 'bn' ? 'ভেরিফিকেশন কোড পাঠান' : language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}</span>
                          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-center text-slate-400">
                    {language === 'bn'
                      ? 'আপনার ইমেইল যাচাই করার জন্য একটি ৬-সংখ্যার কনফার্মেশন কোড পাঠানো হবে।'
                      : language === 'ar'
                      ? 'سيتم إرسال رمز تأكيد مكوّن من ٦ أرقام للتحقق من ملكية بريدك الإلكتروني.'
                      : 'A 6-digit confirmation code will be sent to verify ownership of your email.'}
                  </p>
                </form>
              </div>
            )}

            {/* Step: Register Email Verification Code */}
            {tab === 'register' && registerStep === 'verify' && (
              <div>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#00a8b5] flex items-center justify-center mx-auto mb-3 border border-teal-200/80 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading tracking-tight">
                    {language === 'bn' ? 'আপনার ইমেইল যাচাই করুন' : language === 'ar' ? 'تأكيد بريدك الإلكتروني' : 'Verify Your Email'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' ? (
                      <>আমরা ৬-সংখ্যার একটি ভেরিফিকেশন কোড পাঠিয়েছি: <span className="font-semibold text-slate-800">{email}</span></>
                    ) : language === 'ar' ? (
                      <>لقد أرسلنا رمز تحقق مكوّن من ٦ أرقام إلى: <span className="font-semibold text-slate-800">{email}</span></>
                    ) : (
                      <>We sent a 6-digit verification code to <span className="font-semibold text-slate-800">{email}</span></>
                    )}
                  </p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Preview helper for instant testing in sandboxed preview environment */}
                {previewCode && (
                  <div className="mb-4 p-3 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-900 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-teal-700 block">
                        {language === 'bn' ? 'ভেরিফিকেশন কোড:' : language === 'ar' ? 'رمز التحقق:' : 'Verification Code:'}
                      </span>
                      <span className="font-mono text-base font-bold tracking-widest text-teal-900">{previewCode}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(previewCode)}
                      className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-xs"
                    >
                      {language === 'bn' ? 'অটো-ফিল' : language === 'ar' ? 'تعبئة تلقائية' : 'Auto-fill'}
                    </button>
                  </div>
                )}

                <form onSubmit={handleVerifyAndRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                      {language === 'bn' ? '৬-সংখ্যার কোড লিখুন' : language === 'ar' ? 'أدخل الرمز المكون من ٦ أرقام' : 'Enter 6-Digit Code'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        autoFocus
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        className="w-full text-center py-3 px-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-mono text-2xl font-bold tracking-[0.5em] placeholder-slate-300 focus:outline-none focus:border-teal-500 focus:bg-white transition-all shadow-inner"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full py-2.5 min-h-[44px] rounded-full bg-[#00a8b5] hover:bg-[#0096a3] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-500/25 flex items-center justify-center gap-1.5 cursor-pointer backdrop-blur-md transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{language === 'bn' ? 'যাচাই করে অ্যাকাউন্ট তৈরি করুন' : language === 'ar' ? 'تأكيد وإنشاء الحساب' : 'Verify & Create Account'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterStep('details');
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>{language === 'bn' ? 'তথ্য পরিবর্তন' : language === 'ar' ? 'تعديل البيانات' : 'Edit details'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={resendTimer > 0 || resending}
                      onClick={handleResendCode}
                      className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 disabled:text-slate-400 font-medium transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                      <span>
                        {resendTimer > 0
                          ? (language === 'bn' ? `${formatNumber(resendTimer)} সেকেন্ড পর পুনরায় পাঠান` : language === 'ar' ? `إعادة الإرسال بعد ${formatNumber(resendTimer)} ثانية` : `Resend in ${resendTimer}s`)
                          : (language === 'bn' ? 'কোড পুনরায় পাঠান' : language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code')}
                      </span>
                    </button>
                  </div>

                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('login');
                        resetFormState();
                      }}
                      className="text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'বাতিল করে সাইন ইন-এ ফিরুন' : language === 'ar' ? 'إلغاء والعودة لتسجيل الدخول' : 'Cancel & switch to Sign In'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
