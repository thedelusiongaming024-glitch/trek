import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

interface NewsletterSectionProps {
  currentUser?: { name: string; email: string; role: string; avatar?: string } | null;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  currentUser
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Pre-fill user email when logged in if field is empty
  useEffect(() => {
    if (currentUser?.email && !email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetEmail = (email || currentUser?.email || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(
          data.message ||
          (currentUser?.name
            ? `Thank you ${currentUser.name}! You are now subscribed to our weekly digest.`
            : 'Thank you! You are now subscribed to our weekly digest.')
        );
        if (!currentUser?.email) {
          setEmail('');
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
      {/* Floating Glassmorphic Card */}
      <div className="rounded-3xl bg-white/80 dark:bg-white/10 backdrop-blur-2xl border border-white/80 dark:border-white/20 shadow-[0_20px_60px_rgba(31,38,135,0.08)] overflow-hidden text-slate-800 dark:text-slate-100 p-6 sm:p-10 md:p-12 transition-all relative">
        {/* Subtle decorative internal ambient blur */}
        <div className="absolute top-0 right-1/3 w-80 h-36 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Form & Copy */}
          <div className="md:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                Follow our newsletter
              </h3>
              {currentUser && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Logged in as {currentUser.name}</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
              Get weekly updates on WordPress architectural blueprints, support guidelines, theme optimizations, and community answers delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md">
                <div className="relative flex-1">
                  <input
                    type="email"
                    id="newsletter-email-input"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200/80 dark:border-white/20 bg-white/70 dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 backdrop-blur-md transition-all shadow-xs"
                    disabled={status === 'loading' || status === 'success'}
                  />
                </div>

                <button
                  type="submit"
                  id="newsletter-subscribe-btn"
                  disabled={status === 'loading' || status === 'success'}
                  className="px-6 py-3 min-h-[44px] rounded-xl bg-[#007a64] hover:bg-[#006653] active:scale-98 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-75 backdrop-blur-md"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </div>

              {message && (
                <p className={`mt-2.5 text-xs font-medium ${status === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* Right Column: Envelope & Celebration Balloons Illustration */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-56 sm:w-64 h-52 flex items-center justify-center select-none">
              {/* Custom SVG illustration matching the exact visual style in the reference */}
              <svg
                viewBox="0 0 240 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Dashed ambient sound / celebration lines */}
                <path d="M20 150 L50 150" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M190 150 L220 150" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="35" cy="120" r="2" fill="#94a3b8" />
                <circle cx="205" cy="115" r="2.5" fill="#94a3b8" />
                <path d="M40 170 L60 170" stroke="#e2e8f0" strokeWidth="2" />

                {/* Balloons */}
                <g id="balloons">
                  {/* Balloon 1: Teal */}
                  <ellipse cx="160" cy="35" rx="14" ry="17" fill="#2dd4bf" />
                  <path d="M160 52 L158 55 L162 55 Z" fill="#0d9488" />
                  <path d="M160 55 C160 70 155 85 145 105" stroke="#94a3b8" strokeWidth="1" fill="none" />

                  {/* Balloon 2: Lime/Green */}
                  <ellipse cx="180" cy="28" rx="15" ry="18" fill="#84cc16" />
                  <path d="M180 46 L178 49 L182 49 Z" fill="#65a30d" />
                  <path d="M180 49 C175 68 165 88 152 108" stroke="#94a3b8" strokeWidth="1" fill="none" />

                  {/* Balloon 3: Yellow */}
                  <ellipse cx="198" cy="40" rx="13" ry="16" fill="#facc15" />
                  <path d="M198 56 L196 59 L200 59 Z" fill="#ca8a04" />
                  <path d="M198 59 C188 75 170 95 156 110" stroke="#94a3b8" strokeWidth="1" fill="none" />

                  {/* Balloon Highlights */}
                  <path d="M154 26 C157 24 163 24 166 26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  <path d="M174 19 C177 17 183 17 186 19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                </g>

                {/* Base Shadow */}
                <ellipse cx="140" cy="180" rx="75" ry="8" fill="#e2e8f0" opacity="0.6" />

                {/* Mail Envelope Base */}
                <path
                  d="M75 110 L140 70 L205 110 L205 175 C205 178 203 180 200 180 L80 180 C77 180 75 178 75 175 Z"
                  fill="#0d9488"
                />

                {/* Inner Envelope pocket background */}
                <path
                  d="M80 115 L140 80 L200 115 L200 175 L80 175 Z"
                  fill="#042f2e"
                />

                {/* Letter Sheet sticking out */}
                <g id="letter">
                  <rect x="90" y="85" width="100" height="70" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="102" y1="100" x2="155" y2="100" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" />
                  <line x1="102" y1="112" x2="178" y2="112" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="102" y1="122" x2="168" y2="122" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="102" y1="132" x2="140" y2="132" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  {/* Yellow stamp */}
                  <rect x="165" y="95" width="16" height="18" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
                  <circle cx="173" cy="104" r="4" fill="#facc15" />
                </g>

                {/* Front Envelope Flaps */}
                <path
                  d="M75 110 L140 148 L205 110 L205 175 C205 178 203 180 200 180 L80 180 C77 180 75 178 75 175 Z"
                  fill="#14b8a6"
                />
                <path
                  d="M75 178 L125 138"
                  stroke="#0f766e"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M205 178 L155 138"
                  stroke="#0f766e"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Decorative confetti sparks */}
                <polygon points="60,95 63,90 66,95 63,100" fill="#facc15" />
                <circle cx="80" cy="70" r="3" fill="#38bdf8" />
                <polygon points="215,80 217,76 219,80 217,84" fill="#ec4899" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
