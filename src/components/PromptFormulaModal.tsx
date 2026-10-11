import React, { useState } from 'react';
import { X, Copy, Check, Sparkles, Wand2, Lightbulb, Bot, Terminal } from 'lucide-react';

interface PromptFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptFormulaModal: React.FC<PromptFormulaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptTemplate = `سلام. من می‌خواهم ایده‌ام را در یک سایت تخصصی مهندسی نرم‌افزار به نام RoseUML AI قرار دهم که از آن نمودار کلاس (Class Diagram)، فلوچارت (Flowchart)، نمودار یوزکیس (Use Case) و فایل‌های اختصاصی نرم‌افزار Rational Rose (.mdl و .ebs) تولید می‌کند.

لطفاً ایده من را به یک سناریوی جامع و استاندارد مهندسی نرم‌افزار (شامل بخش‌های زیر) بسط بده و فقط متن نهایی را به من تحویل بده تا عیناً در سایت کپی کنم:

ایده من:
[ایده یا موضوع پروژه خود را اینجا بنویسید، مثلاً: سیستم رزرواسیون سالن‌های ورزشی]

الزامات سناریو برای سایت RoseUML AI:
۱. نام و هدف کلی سیستم
۲. نقش‌ها و بازیگران (Actors): حداقل ۲ الی ۳ نقش کلیدی (مثلاً مشتری، مدیر، درگاه بانکی)
۳. کلاس‌های اصلی داده‌ای (Entities): مشخص کردن حداقل ۵ تا ۸ کلاس با سلسله‌مراتب ارث‌بری (کلاس والد مثل Person و فرزندان)
۴. کلاس‌های کنترلی یا محاسباتی (Control/Boundary): مانند موتور محاسبه هزینه، کنترلر پرداخت یا سرویس پیامک
۵. روابط مهم: مشخص کردن روابط ترکیب (Composition)، تجمیع (Aggregation) و ارث‌بری (Inheritance)
۶. گام‌های فرآیند برای فلوچارت: مراحل شروع، ورود داده‌ها، شرط‌ها و بررسی‌ها (مثلاً آیا سانس خالی است؟ آیا پرداخت موفق است؟) تا ثبت نهایی
۷. فیلدها و متدهای کلیدی مورد نیاز

لطفاً یک متن منسجم و یکپارچه به زبان فارسی (با نام‌های کلاس به انگلیسی داخل پرانتز) برای من تولید کن.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                متن آماده (پرامپت) برای ارسال به هوش مصنوعی (ChatGPT / Gemini / Claude)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                این متن را کپی کنید، موضوع خود را در آن بگذارید و به ChatGPT بدهید تا بهترین سناریو را تحویل بگیرید
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>چگونه کار می‌کند؟</strong> کافی است کادر زیر را کپی کنید و در چت‌جی‌پی‌تی یا هر هوش مصنوعی دیگری پیست نمایید و ایده خام خود را در قسمت مشخص شده بنویسید. هوش مصنوعی یک سناریوی بی‌نقص متناسب با استانداردهای Rational Rose تولید می‌کند که می‌توانید بلافاصله در سایت قرار دهید!
            </div>
          </div>

          <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
            {promptTemplate}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            پس از دریافت پاسخ از AI، آن را در کادر ورودی این سایت قرار داده و دکمه تولید را بزنید.
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'کپی شد!' : 'کپی کل متن پرامپت'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
