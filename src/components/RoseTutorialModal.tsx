import React, { useState } from 'react';
import { X, BookOpen, CheckCircle2, AlertTriangle, Monitor, Play, FileCode, Layers, ArrowLeft } from 'lucide-react';

interface RoseTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoseTutorialModal: React.FC<RoseTutorialModalProps> = ({ isOpen, onClose }) => {
  const [activeMethod, setActiveMethod] = useState<'script' | 'mdl' | 'tips'>('script');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                راهنمای گام‌به‌گام ایمپورت در IBM Rational Rose (رشنال رویز)
              </h3>
              <p className="text-xs text-slate-400">
                چگونه بدون کشیدن دستی حتی یک کلاس، مدل کامل را وارد نرم‌افزار مهندسی نرم‌افزار کنید
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

        {/* Method Switcher Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveMethod('script')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeMethod === 'script'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>روش ۱: اجرای اسکریپت .ebs (۱۰۰٪ بدون خطا روی تمام نسخه‌ها)</span>
          </button>

          <button
            onClick={() => setActiveMethod('mdl')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeMethod === 'mdl'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>روش ۲: باز کردن مستقیم فایل .mdl</span>
          </button>

          <button
            onClick={() => setActiveMethod('tips')}
            className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 cursor-pointer ${
              activeMethod === 'tips'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>نکات طلایی تحویل پروژه کلاسی</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {activeMethod === 'script' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs">
                💡 <strong>چرا این روش بهترین است؟</strong> نسخه‌های مختلف رشنال رویز (Rose 2000، 2002، 2003، یا نسخه سازمانی) گاهی به ورژن فایل‌های .mdl حساس هستند. اما موتور <strong>Rose Script</strong> در تمام نسخه‌ها استاندارد کار می‌کند و کلاس‌ها را از ریشه می‌سازد!
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۱
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">دانلود فایل اسکریپت</h4>
                    <p className="text-xs text-slate-400">
                      روی دکمه آبی‌رنگ <strong className="text-indigo-400">«دانلود اسکریپت .EBS»</strong> در همین سایت کلیک کنید تا فایل ذخیره شود.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۲
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">باز کردن پنجره اسکریپت در رشنال رویز</h4>
                    <p className="text-xs text-slate-400">
                      نرم‌افزار IBM Rational Rose را باز کنید. از منوی بالای صفحه بروید به:
                      <br />
                      <code className="text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded text-xs mt-1 inline-block">
                        Tools ➔ Open Script...
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۳
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">انتخاب فایل .ebs و اجرا</h4>
                    <p className="text-xs text-slate-400">
                      فایل دانلود شده را انتخاب کنید و دکمه Open را بزنید. سپس در پنجره باز شده ادیتور اسکریپت، روی آیکون <strong>مثلث سبز (Run)</strong> کلیک کنید یا کلید <strong>F5</strong> را بزنید.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۴
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">مشاهده آنی نمودار و درخت کلاس‌ها</h4>
                    <p className="text-xs text-slate-400">
                      یک پیام تایید ظاهر می‌شود. حالا در پنل درختی سمت چپ در قسمت <strong>Logical View</strong>، تمام کلاس‌ها با متدها و فیلدهایشان اضافه شده‌اند و روی صفحه دیاگرام کلاس چیده شده‌اند!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'mdl' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
                📄 فایل‌های با پسوند <code className="text-rose-300 font-mono">.mdl</code> فرمت اصلی پروژه‌های نرم‌افزار Rational Rose هستند.
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۱
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">دانلود فایل .mdl</h4>
                    <p className="text-xs text-slate-400">
                      روی دکمه قرمز <strong className="text-rose-400">«دانلود فایل .MDL»</strong> در پنل خروجی کلیک کنید.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۲
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">باز کردن در نرم‌افزار</h4>
                    <p className="text-xs text-slate-400">
                      در برنامه Rational Rose، از منوی بالا کلیک کنید:
                      <br />
                      <code className="text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded text-xs mt-1 inline-block">
                        File ➔ Open...
                      </code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    ۳
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs mb-1">مشاهده دیاگرام Main</h4>
                    <p className="text-xs text-slate-400">
                      در پنجره درختی چپ، روی <strong className="text-white">Logical View</strong> دابل کلیک کنید و سپس روی دیاگرام <strong className="text-white">Main</strong> دو بار کلیک کنید تا تمام کلاس‌ها و فلش‌های روابط باز شوند.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'tips' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                🎓 <strong>نکات ویژه برای درس‌های مهندسی نرم‌افزار ۱ و ۲ و آزمایشگاه:</strong>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">نمایش تمام متدها و خصوصیات در دیاگرام:</strong>
                    <br />
                    اگر در رشنال رویز فیلدها یا متدها جمع شده بودند، کلید Ctrl+A را بزنید تا تمام کلاس‌ها انتخاب شوند، سپس کلیک راست کرده و گزینه <code className="text-amber-300">Options ➔ Show All Attributes</code> و <code className="text-amber-300">Show All Operations</code> را تیک بزنید.
                  </div>
                </li>

                <li className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">نمایش استریوتایپ‌ها (Stereotypes):</strong>
                    <br />
                    برای نمایش لیبل‌های مثل &lt;&lt;entity&gt;&gt; یا &lt;&lt;control&gt;&gt; روی کلاس راست کلیک کرده و <code className="text-amber-300">Stereotype Display ➔ Label</code> را انتخاب کنید.
                  </div>
                </li>

                <li className="flex items-start gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">خروجی عکس باکیفیت برای گزارش کار یا ورد (Word):</strong>
                    <br />
                    در رشنال رویز می‌توانید با رفتن به منوی <code className="text-amber-300">Edit ➔ Copy Diagram</code> عکس دیاگرام را مستقیماً کپی کرده و در ورد یا اسلاید پاورپوینت Paste کنید.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            متوجه شدم، بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
};
