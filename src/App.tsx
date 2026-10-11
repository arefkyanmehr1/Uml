import React, { useState } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { DiagramCanvas } from './components/DiagramCanvas';
import { UseCaseCanvas } from './components/UseCaseCanvas';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { RoseExportPanel } from './components/RoseExportPanel';
import { RoseTutorialModal } from './components/RoseTutorialModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { ClassPersianSidePanel } from './components/ClassPersianSidePanel';
import { UMLModel, UMLClass } from './types/uml';
import { SAMPLE_MODELS } from './data/sampleModels';
import { generateRoseMdl, generateRoseScript } from './utils/rationalRoseGenerator';
import { generateUmlPdf } from './utils/pdfGenerator';
import {
  Layers,
  Users,
  Download,
  FolderTree,
  BookOpen,
  FileDown,
  Sparkles,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  GitCommit,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [model, setModel] = useState<UMLModel>(SAMPLE_MODELS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'class' | 'flowchart' | 'usecase' | 'export' | 'tree'>('class');
  
  // State for Persian side panel
  const [inspectedClass, setInspectedClass] = useState<UMLClass | null>(null);
  // State for editor modal
  const [editingClass, setEditingClass] = useState<UMLClass | null>(null);

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGenerate = async (prompt: string, complexity: 'standard' | 'advanced') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          complexity,
          language: 'fa',
        }),
      });

      if (!res.ok) {
        throw new Error('خطا در دریافت پاسخ از سرور');
      }

      const data: UMLModel = await res.json();
      setModel(data);
      showToast(`مدل و فلوچارت «${data.systemName}» با موفقیت برای Rational Rose تولید شد!`);
      setActiveView('class');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'خطا در ارتباط با هوش مصنوعی. لطفاً مجدد تلاش نمایید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: UMLModel) => {
    setModel(sample);
    showToast(`نمونه آماده «${sample.systemName}» بارگذاری شد.`);
  };

  const handleUpdateClass = (updatedClass: UMLClass) => {
    setModel(prev => ({
      ...prev,
      classes: prev.classes.map(c => (c.name === updatedClass.name || c.id === updatedClass.id ? updatedClass : c)),
    }));
    showToast(`تغییرات کلاس ${updatedClass.name} در مدل ذخیره شد.`);
  };

  const handleDeleteClass = (className: string) => {
    setModel(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.name !== className),
      relationships: prev.relationships.filter(r => r.source !== className && r.target !== className),
    }));
    showToast(`کلاس ${className} از مدل حذف شد.`);
    setInspectedClass(null);
  };

  // Downloads
  const downloadMdl = () => {
    const content = generateRoseMdl(model);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}.mdl`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('فایل مدل رشنال رویز (.mdl) دانلود شد.');
  };

  const downloadScript = () => {
    const content = generateRoseScript(model);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}_Automation.ebs`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('اسکریپت خودکار رشنال رویز (.ebs) دانلود شد.');
  };

  const downloadPdf = async () => {
    setIsExportingPdf(true);
    showToast('در حال آماده‌سازی و ساخت فایل PDF با کیفیت بالا...');
    try {
      const svgEl = document.getElementById('diagram-svg') as unknown as SVGSVGElement | null;
      await generateUmlPdf(model, svgEl);
      showToast('فایل PDF مستندات و دیاگرام با موفقیت دانلود شد.');
    } catch (err) {
      console.error(err);
      setErrorMessage('خطا در تولید فایل PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* App Header */}
      <Header
        onOpenTutorial={() => setIsTutorialOpen(true)}
        systemName={model.systemName}
        hasModel={!!model}
        onDownloadMdl={downloadMdl}
        onDownloadScript={downloadScript}
        onDownloadPdf={downloadPdf}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Banner with Rational Rose focus */}
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                مولد هوشمند مدل مهندسی نرم‌افزار، فلوچارت و Rational Rose
                <span className="text-[10px] sm:text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  سازگار ۱۰۰٪ با نسخه‌های Rose
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                روی هر کلاس یا جدول کلیک کنید تا توضیحات فارسی آن در سایدبار نمایش یابد. فلوچارت فرآیند نیز به صورت خودکار طراحی شده است.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              onClick={downloadPdf}
              disabled={isExportingPdf}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition cursor-pointer disabled:opacity-50"
              title="دانلود فایل PDF گزارش"
            >
              <FileDown className="w-4 h-4" />
              <span>دانلود PDF</span>
            </button>

            <button
              onClick={() => setIsTutorialOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>آموزش Rose</span>
            </button>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white cursor-pointer mr-2">✕</button>
          </div>
        )}

        {/* Idea Input Component */}
        <PromptInput
          onGenerate={handleGenerate}
          onSelectSample={handleSelectSample}
          isLoading={isLoading}
        />

        {/* Responsive Model Metrics & Navigation Tabs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-3">
          {/* Metrics summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="font-bold text-white text-xs sm:text-sm">{model.systemName}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-300">{model.classes.length} کلاس</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300">{model.relationships.length} رابطه</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                {model.flowchart?.nodes.length || 6} گام فلوچارت
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300">{model.useCases.length} یوزکیس</span>
            </div>
          </div>

          {/* Horizontally scrollable Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => setActiveView('class')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeView === 'class'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>دیاگرام کلاس (Class Diagram)</span>
            </button>

            <button
              onClick={() => setActiveView('flowchart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeView === 'flowchart'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>فلوچارت فرآیند (Flowchart)</span>
            </button>

            <button
              onClick={() => setActiveView('usecase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeView === 'usecase'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>دیاگرام یوزکیس (Use Case)</span>
            </button>

            <button
              onClick={() => setActiveView('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeView === 'tree'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>درخت کلاس‌ها (Logical View)</span>
            </button>

            <button
              onClick={() => setActiveView('export')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeView === 'export'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود Rose & PDF</span>
            </button>
          </div>
        </div>

        {/* View Content */}
        {activeView === 'class' && (
          <div className="space-y-3">
            <DiagramCanvas
              model={model}
              onSelectClass={(c) => setInspectedClass(c)}
              onDownloadPdf={downloadPdf}
            />
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>برای مشاهده تحلیل فارسی کامل هر کلاس یا جدول، روی آن کلیک کنید یا با انگشت ضربه بزنید تا سایدبار فارسی باز شود.</span>
              </span>
              <button
                onClick={() => setActiveView('flowchart')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer shrink-0"
              >
                مشاهده فلوچارت خودکار ➔
              </button>
            </div>
          </div>
        )}

        {activeView === 'flowchart' && (
          <div className="space-y-4">
            <FlowchartCanvas
              flowchart={model.flowchart}
              systemName={model.systemName}
            />
          </div>
        )}

        {activeView === 'usecase' && (
          <div className="space-y-4">
            <UseCaseCanvas model={model} />
          </div>
        )}

        {activeView === 'tree' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-rose-400 shrink-0" />
                <h3 className="font-bold text-sm text-white">
                  درخت ساختار منطقی (Logical View در Rational Rose)
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                روی هر کارت کلیک کنید تا توضیحات و جزئیات فارسی آن در سایدبار باز شود
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {model.classes.map((cls) => (
                <div
                  key={cls.id || cls.name}
                  onClick={() => setInspectedClass(cls)}
                  className="bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-xl p-3.5 sm:p-4 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-rose-400 font-mono" dir="ltr">
                      {cls.name}
                    </span>
                    <span className="text-xs text-amber-300 font-medium">
                      {cls.persianName || ''}
                    </span>
                  </div>
                  {cls.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                      {cls.description}
                    </p>
                  )}

                  {/* Attributes */}
                  <div className="mb-2">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      خصوصیات ({cls.attributes.length}):
                    </span>
                    <div className="space-y-1">
                      {cls.attributes.slice(0, 4).map((a, i) => (
                        <div key={i} className="text-[11px] font-mono text-slate-300 flex items-center justify-between" dir="ltr">
                          <span className={a.visibility === 'public' ? 'text-emerald-400' : 'text-rose-400'}>
                            {a.visibility === 'public' ? '+' : '-'}{a.name}
                          </span>
                          <span className="text-slate-500 text-[10px]">{a.type}</span>
                        </div>
                      ))}
                      {cls.attributes.length > 4 && (
                        <span className="text-[10px] text-slate-500 italic">+ {cls.attributes.length - 4} فیلد دیگر</span>
                      )}
                    </div>
                  </div>

                  {/* Methods */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      متدها ({cls.methods.length}):
                    </span>
                    <div className="space-y-1">
                      {cls.methods.slice(0, 3).map((m, i) => (
                        <div key={i} className="text-[11px] font-mono text-slate-300 flex items-center justify-between" dir="ltr">
                          <span className="text-sky-300">
                            {m.name}()
                          </span>
                          <span className="text-slate-500 text-[10px]">{m.returnType}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-rose-400 flex items-center justify-between">
                    <span>مشاهده توضیحات فارسی</span>
                    <span>➔</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'export' && (
          <RoseExportPanel
            model={model}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onDownloadPdf={downloadPdf}
          />
        )}
      </main>

      {/* Persian Side Panel Drawer when clicking any class */}
      <ClassPersianSidePanel
        cls={inspectedClass}
        model={model}
        isOpen={!!inspectedClass}
        onClose={() => setInspectedClass(null)}
        onEditClass={(c) => {
          setInspectedClass(null);
          setEditingClass(c);
        }}
      />

      {/* Class Inspector / Editor Modal */}
      <ClassDetailModal
        cls={editingClass}
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        onSave={handleUpdateClass}
        onDeleteClass={handleDeleteClass}
      />

      {/* Step by step Rational Rose tutorial modal */}
      <RoseTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce max-w-[90vw]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 px-4">
        <p>
          RoseUML AI • ویژه پروژه‌های مهندسی نرم‌افزار، آزمایشگاه UML، فلوچارت‌های سیستمی و Rational Rose
        </p>
      </footer>
    </div>
  );
}
