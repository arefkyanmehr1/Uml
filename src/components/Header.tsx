import React from 'react';
import { Layers, FileCode, BookOpen, Download, FileDown } from 'lucide-react';

interface HeaderProps {
  onOpenTutorial: () => void;
  systemName?: string;
  hasModel: boolean;
  onDownloadMdl: () => void;
  onDownloadScript: () => void;
  onDownloadPdf?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTutorial,
  systemName,
  hasModel,
  onDownloadMdl,
  onDownloadScript,
  onDownloadPdf,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-rose-300 bg-clip-text text-transparent truncate">
                RoseUML AI
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                Rational Rose
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              مولد خودکار مدل و دیاگرام‌های Rational Rose (.mdl , .ebs)
            </p>
          </div>
        </div>

        {/* Action Buttons - Fully Responsive */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onOpenTutorial}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="آموزش گام‌به‌گام رشنال رویز"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">راهنمای Rose</span>
          </button>

          {hasModel && (
            <>
              {onDownloadPdf && (
                <button
                  onClick={onDownloadPdf}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  title="دانلود گزارش مستندات و دیاگرام به فرمت PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">دانلود PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
              )}

              <button
                onClick={onDownloadMdl}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                title="دانلود فایل .mdl رشنال رویز"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.mdl</span>
              </button>

              <button
                onClick={onDownloadScript}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                title="دانلود اسکریپت .ebs رشنال رویز"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>.ebs</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
