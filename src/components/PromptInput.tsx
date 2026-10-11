import React, { useState } from 'react';
import { Sparkles, Wand2, Lightbulb, ArrowRight } from 'lucide-react';
import { SAMPLE_MODELS } from '../data/sampleModels';
import { UMLModel } from '../types/uml';
import { PromptFormulaModal } from './PromptFormulaModal';

interface PromptInputProps {
  onGenerate: (prompt: string, complexity: 'standard' | 'advanced') => void;
  onSelectSample: (model: UMLModel) => void;
  isLoading: boolean;
}

const TEMPLATE_IDEAS = [
  {
    title: 'فروشگاه اینترنتی جامع',
    tag: 'E-Commerce',
    prompt: 'یک سامانه فروشگاه اینترنتی مدرن شامل مدیریت کاربران و مشتریان، سبد خرید، مدیریت محصولات با دسته‌بندی و انبار، سفارشات با وضعیت‌های مختلف، درگاه پرداخت اینترنتی، فاکتور و ارسال پستی مرسوله با روابط ارث‌بری و ترکیب.',
  },
  {
    title: 'سامانه آموزش دانشگاهی (گلستان)',
    tag: 'University',
    prompt: 'سامانه آموزش و انتخاب واحد دانشگاهی شامل کلاس‌های شخص (Person)، دانشجو، استاد، درس با پیش‌نیازها، ترم تحصیلی، ثبت‌نام و کارنامه، محاسبه معدل و تایید آموزش کل.',
  },
  {
    title: 'سامانه تاکسی اینترنتی (اسنپ/تپسی)',
    tag: 'Ride Hailing',
    prompt: 'سامانه هوشمند درخواست خودرو آنلاین شامل مسافر، راننده، سفر، موقعیت مکانی زنده، موتور قیمت‌گذاری پویا، کیف پول اعتباری و سیستم امتیازدهی دوطرفه.',
  },
  {
    title: 'مدیریت بیمارستان و نوبت‌دهی',
    tag: 'Healthcare',
    prompt: 'سیستم جامع مدیریت بیمارستان شامل بخش‌ها، پزشکان، بیماران، پرونده پزشکی الکترونیک، نوبت‌دهی ویزیت آنلاین، بستری و ترخیص، و صدور صورتحساب بیمه.',
  },
  {
    title: 'سامانه رزرو هتل و اقامتگاه',
    tag: 'Booking',
    prompt: 'سیستم رزرواسیون آنلاین هتل شامل اتاق‌ها، مهمانان، رزرواسیون با بازه تاریخی، محاسبه هزینه شبانه، بیعانه، خدمات جانبی (صبحانه/ترانسفر) و تسویه نهایی.',
  },
  {
    title: 'اتوماسیون اداری و گردش مکاتبات',
    tag: 'ERP',
    prompt: 'سیستم اتوماسیون اداری شامل کاربر، نامه‌های اداری (صادره، وارده، داخلی)، فرآیند ارجاع و پاراف، پیوست مدارک، بایگانی دیجیتال و کارتابل پرسنلی.',
  }
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onGenerate,
  onSelectSample,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState<'standard' | 'advanced'>('standard');
  const [activeTab, setActiveTab] = useState<'custom' | 'templates'>('custom');
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt.trim(), complexity);
  };

  const handleApplyTemplate = (templatePrompt: string) => {
    setPrompt(templatePrompt);
    setActiveTab('custom');
  };

  return (
    <>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-right">
        {/* Tab Switcher - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                تبدیل ایده به مدل Rational Rose & UML
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                سناریوی نرم‌افزاری خود را بنویسید تا تمام کلاس‌ها، متدها و روابط تولید شوند
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsFormulaOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
              title="متن آماده برای دادن به هوش مصنوعی"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>فرمول آماده پرامپت ChatGPT</span>
            </button>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                نوشتن ایده من
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'templates'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                نمونه‌های آماده
              </button>
            </div>
          </div>
        </div>

      {activeTab === 'custom' ? (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="مثال: من می‌خواهم یک سیستم کتابخانه آنلاین بسازم که در آن کاربران کتاب‌ها را جستجو کرده و امانت بگیرند. سیستم باید کتابدار، جریمه دیرکرد، دسته‌بندی کتاب‌ها و تاریخچه امانت داشته باشد..."
              rows={3}
              disabled={isLoading}
              dir="rtl"
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none leading-relaxed"
            />
            <div className="absolute bottom-2 left-3">
              <span className="text-[10px] text-slate-500 font-mono">
                {prompt.length} کاراکتر
              </span>
            </div>
          </div>

          {/* Quick presets pills (horizontally scrollable on mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              پیشنهادات:
            </span>
            {TEMPLATE_IDEAS.slice(0, 4).map((t, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPrompt(t.prompt)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition shrink-0 cursor-pointer"
              >
                {t.title}
              </button>
            ))}
          </div>

          {/* Bottom Settings & Submit */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Complexity Option */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">جزئیات مدل:</span>
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setComplexity('standard')}
                  className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-md font-medium transition cursor-pointer ${
                    complexity === 'standard'
                      ? 'bg-slate-800 text-rose-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  استاندارد (۵ تا ۸ کلاس)
                </button>
                <button
                  type="button"
                  onClick={() => setComplexity('advanced')}
                  className={`px-2.5 py-1 text-[11px] sm:text-xs rounded-md font-medium transition cursor-pointer ${
                    complexity === 'advanced'
                      ? 'bg-slate-800 text-rose-300 shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  پیشرفته دانشگاهی (۸ تا ۱۵ کلاس)
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-900/30 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال تحلیل معماری نرم‌افزار و تولید مدل...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تولید مدل رشنال رویز و دیاگرام</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Ready-made Templates */
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            روی هر یک از سناریوهای استاندارد زیر کلیک کنید تا بلافاصله مدل و فایل‌های Rational Rose (.mdl و .ebs) برای آن لود شوند:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_MODELS.map((m) => (
              <div
                key={m.id}
                onClick={() => onSelectSample(m)}
                className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/50 rounded-xl p-3.5 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      {m.classes.length} کلاس • {m.relationships.length} رابطه
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {m.useCases.length} یوزکیس
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition mb-1">
                    {m.systemName}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-rose-400 font-medium">
                  <span>لود فوری مدل کامل</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition" />
                </div>
              </div>
            ))}

            {TEMPLATE_IDEAS.slice(3).map((t, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyTemplate(t.prompt)}
                className="bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition mb-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {t.prompt}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-300 font-medium">
                  <span>ارسال به هوش مصنوعی</span>
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Prompt formula modal */}
    <PromptFormulaModal
      isOpen={isFormulaOpen}
      onClose={() => setIsFormulaOpen(false)}
    />
  </>
);
};
