import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CalloutBannerProps {
  onAskQuestion: () => void;
}

export const CalloutBanner: React.FC<CalloutBannerProps> = ({ onAskQuestion }) => {
  return (
    <section className="relative w-full my-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Frosted Glass Banner Container */}
        <div className="relative rounded-3xl bg-white/75 dark:bg-white/10 backdrop-blur-2xl border border-white/80 dark:border-white/20 p-6 sm:p-12 shadow-[0_12px_40px_rgba(31,38,135,0.08)] overflow-hidden">
          {/* Ambient subtle light orbs inside glass */}
          <div className="absolute top-0 right-1/4 w-96 h-48 bg-gradient-to-r from-teal-400/15 via-cyan-400/15 to-indigo-400/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-40 bg-emerald-400/15 blur-2xl rounded-full pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 text-center md:text-left z-10">
            {/* Left: Illustrative Avatar / Speech Bubble Graphic */}
            <div className="relative flex items-center justify-center shrink-0">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                {/* Turquoise speech bubble with dots */}
                <div className="absolute -bottom-1 -left-2 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-teal-500/25 flex items-center justify-center text-white rotate-[-6deg] z-10 backdrop-blur-md border border-white/30">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* White / glassy speech bubble with Question mark */}
                <div className="absolute -top-1 -right-2 w-16 h-16 rounded-2xl bg-white/95 dark:bg-white/20 backdrop-blur-xl shadow-xl shadow-indigo-900/10 border border-white/80 dark:border-white/30 flex items-center justify-center rotate-[8deg] z-20">
                  <span className="text-2xl font-black text-teal-700 dark:text-teal-300 font-heading">?</span>
                </div>

                {/* Smiling avatar badge */}
                <div className="absolute -bottom-2 right-1 w-9 h-9 rounded-full bg-amber-400 border-2 border-white dark:border-slate-800 flex items-center justify-center text-slate-950 text-sm font-bold shadow-md z-30">
                  😊
                </div>
              </div>
            </div>

            {/* Middle: Content & Typography */}
            <div className="flex-1 max-w-2xl">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight font-heading mb-2.5">
                New to Communities?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Its members are ambitious local authorities and development corporations planning and delivering exemplary support frameworks, architectural solutions, and collaborative knowledge.
              </p>
            </div>

            {/* Right: Action Button */}
            <div className="shrink-0 w-full sm:w-auto flex justify-center">
              <button
                onClick={onAskQuestion}
                id="banner-ask-question-btn"
                className="w-full sm:w-auto px-7 py-3 min-h-[44px] flex items-center justify-center rounded-full bg-[#00a8b5] hover:bg-[#0096a3] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-teal-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap backdrop-blur-md"
              >
                Ask a Question
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slider indicator and edge navigation arrows on canvas below banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex items-center justify-between">
        <button
          aria-label="Previous slide"
          className="w-8 h-8 rounded-full border border-white/80 dark:border-white/20 bg-white/75 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        {/* Centered Slider Bar indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-1 w-12 rounded-full bg-[#00a8b5]" />
          <div className="h-1 w-3 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 transition-colors cursor-pointer" />
          <div className="h-1 w-3 rounded-full bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 transition-colors cursor-pointer" />
        </div>

        <button
          aria-label="Next slide"
          className="w-8 h-8 rounded-full border border-white/80 dark:border-white/20 bg-white/75 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs cursor-pointer backdrop-blur-md"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
