import React, { useState } from 'react';
import { UMLClass, UMLModel, Attribute, Method } from '../types/uml';
import {
  X,
  Shield,
  Code,
  GitBranch,
  Layers,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { generateJavaCode } from '../utils/codeGenerator';

interface ClassPersianSidePanelProps {
  cls: UMLClass | null;
  model: UMLModel;
  isOpen: boolean;
  onClose: () => void;
  onEditClass: (cls: UMLClass) => void;
}

export const ClassPersianSidePanel: React.FC<ClassPersianSidePanelProps> = ({
  cls,
  model,
  isOpen,
  onClose,
  onEditClass,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'attrs' | 'methods' | 'relations' | 'code'>('info');

  if (!isOpen || !cls) return null;

  // Find relationships involving this class
  const classRelations = model.relationships.filter(
    r => r.source === cls.name || r.target === cls.name
  );

  const getStereotypeDescription = (st?: string) => {
    switch (st) {
      case 'entity':
        return 'موجودیت داده‌ای (Entity): این کلاس داده‌های اصلی و ماندگار سیستم را ذخیره می‌کند و معمولاً متناظر با یک جدول پایگاه داده است.';
      case 'control':
        return 'کنترل‌کننده منطق (Control): مدیریت فرآیندهای تجاری، تراکنش‌ها و هماهنگی میان موجودیت‌ها را برعهده دارد.';
      case 'boundary':
        return 'واسط ارتباطی (Boundary): پل ارتباطی میان کاربر یا سیستم‌های خارجی با هسته نرم‌افزار است.';
      case 'abstract':
        return 'کلاس تجریدی (Abstract): کلاس پایه که ساختار مشترک کلاس‌های فرزند را تعریف کرده و مستقیماً نمونه‌سازی نمی‌شود.';
      case 'interface':
        return 'اینترفیس (Interface): قراردادی شامل امضای متدها که کلاس‌های دیگر باید آن را پیاده‌سازی کنند.';
      default:
        return 'کلاس شی‌ءگرا استاندارد (Standard Class): مدل‌کننده یکی از مفاهیم اصلی دامنه نرم‌افزار.';
    }
  };

  const handleCopyCode = () => {
    const code = generateJavaCode(cls, model);
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-fade-in"
      />

      {/* Persian Side Panel Drawer */}
      <aside
        className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[460px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-right font-sans animate-slide-left overflow-hidden"
        dir="rtl"
      >
        {/* Panel Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-900/30 shrink-0">
              {cls.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-mono" dir="ltr">
                  {cls.name}
                </h3>
                {cls.stereotype && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-rose-300 border border-slate-700">
                    &lt;&lt;{cls.stereotype}&gt;&gt;
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-300 font-medium">
                {cls.persianName || 'تحلیل و تشریح کلاس به زبان فارسی'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-950/70 px-3 pt-2 border-b border-slate-800 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'info'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            معرفی و نقش
          </button>
          <button
            onClick={() => setActiveTab('attrs')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'attrs'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            فیلدها ({cls.attributes.length})
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'methods'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            متدها ({cls.methods.length})
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'relations'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            روابط ({classRelations.length})
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 shrink-0 cursor-pointer ${
              activeTab === 'code'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            کد Java
          </button>
        </div>

        {/* Panel Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-300 leading-relaxed">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Persian Role description */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  نقش این کلاس در سیستم:
                </span>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {cls.description || `کلاس ${cls.name} به عنوان یکی از اجزای محوری مدل شی‌ءگرا برای مدیریت داده‌ها و منطق سامانه به کار می‌رود.`}
                </p>
              </div>

              {/* Stereotype breakdown */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-sky-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  تحلیل نوع کلاس (Stereotype):
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {getStereotypeDescription(cls.stereotype)}
                </p>
              </div>

              {/* Rose location */}
              <div className="bg-rose-950/30 p-3.5 rounded-xl border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">موقعیت در نرم‌افزار Rational Rose:</strong>
                  این کلاس با نام <code className="text-rose-300 font-mono" dir="ltr">{cls.name}</code> در شاخه <strong>Logical View</strong> ایجاد شده و در دیاگرام اصلی Class Diagram قرار می‌گیرد.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attrs' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                فیلدها (Attributes) و خصوصیات داده‌ای این کلاس با سطح دسترسی:
              </p>

              {cls.attributes.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-500">
                  این کلاس فاقد فیلد است.
                </div>
              ) : (
                cls.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono" dir="ltr">
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className={
                            attr.visibility === 'public'
                              ? 'text-emerald-400'
                              : attr.visibility === 'protected'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {attr.visibility === 'public' ? '+ public' : attr.visibility === 'protected' ? '# protected' : '- private'}
                        </span>
                        <span className="text-white">{attr.name}</span>
                      </span>
                      <span className="text-sky-300 text-[11px] font-semibold">{attr.type}</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal pt-1 border-t border-slate-850">
                      {attr.description || `فیلد ${attr.name} از نوع ${attr.type} برای نگهداری داده در این کلاس.`}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'methods' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                متدها و عملیات (Operations) این کلاس به همراه نوع بازگشتی و پارامترها:
              </p>

              {cls.methods.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-500">
                  این کلاس فاقد متد است.
                </div>
              ) : (
                cls.methods.map((m, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono" dir="ltr">
                      <span className="flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className={
                            m.visibility === 'public'
                              ? 'text-emerald-400'
                              : m.visibility === 'protected'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {m.visibility === 'public' ? '+' : m.visibility === 'protected' ? '#' : '-'}
                        </span>
                        <span className="text-white">{m.name}()</span>
                      </span>
                      <span className="text-emerald-300 text-[11px] font-semibold">: {m.returnType}</span>
                    </div>

                    {m.parameters.length > 0 && (
                      <div className="text-[10px] text-slate-400 font-mono" dir="ltr">
                        پارامترها: {m.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 leading-normal pt-1 border-t border-slate-850">
                      {m.description || `متد ${m.name} برای پردازش عملیات و بازگرداندن ${m.returnType}.`}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'relations' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-400 mb-2">
                ارتباطات این کلاس با سایر بخش‌های نمودار:
              </p>

              {classRelations.length === 0 ? (
                <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-500">
                  هیچ رابطه مستقیمی ثبت نشده است.
                </div>
              ) : (
                classRelations.map((rel, idx) => {
                  const isSource = rel.source === cls.name;
                  const otherClass = isSource ? rel.target : rel.source;

                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-rose-400" />
                          ارتباط با <code className="text-rose-300 font-mono" dir="ltr">{otherClass}</code>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {rel.type}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        {rel.label ? `عنوان رابطه: ${rel.label}` : `رابطه از نوع ${rel.type}`}
                        {rel.sourceMultiplicity && ` • چندگانگی: ${rel.sourceMultiplicity} به ${rel.targetMultiplicity || '1'}`}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">کد جاوا تولید شده از این کلاس:</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'کپی شد' : 'کپی کد'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-80 text-left" dir="ltr">
                <code>{generateJavaCode(cls, model)}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onEditClass(cls)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>ویرایش فیلدها و متدها</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            متوجه شدم، بستن
          </button>
        </div>
      </aside>
    </>
  );
};
