import React, { useState } from 'react';
import { UMLModel } from '../types/uml';
import { generateRoseMdl, generateRoseScript } from '../utils/rationalRoseGenerator';
import { generateXMI } from '../utils/xmiGenerator';
import { generatePlantUml, generatePlantUmlUseCase, generateMermaidClassDiagram } from '../utils/plantUmlGenerator';
import { generateJavaCode, generateCppCode, generatePythonCode } from '../utils/codeGenerator';
import { generateUmlPdf } from '../utils/pdfGenerator';
import { Download, Copy, Check, FileText, Code2, Terminal, Info, ExternalLink, HelpCircle, FileDown } from 'lucide-react';

interface RoseExportPanelProps {
  model: UMLModel;
  onOpenTutorial: () => void;
  onDownloadPdf?: () => void;
}

export const RoseExportPanel: React.FC<RoseExportPanelProps> = ({ model, onOpenTutorial, onDownloadPdf }) => {
  const [activeTab, setActiveTab] = useState<'mdl' | 'ebs' | 'xmi' | 'plantuml' | 'code'>('mdl');
  const [selectedLanguage, setSelectedLanguage] = useState<'java' | 'cpp' | 'python'>('java');
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Generate contents
  const mdlContent = generateRoseMdl(model);
  const ebsContent = generateRoseScript(model);
  const xmiContent = generateXMI(model);
  const plantUmlContent = generatePlantUml(model);
  const codeContent =
    selectedLanguage === 'java'
      ? model.classes.map(c => generateJavaCode(c, model)).join('\n\n// ----------------------------------------\n\n')
      : selectedLanguage === 'cpp'
      ? model.classes.map(c => generateCppCode(c, model)).join('\n\n// ----------------------------------------\n\n')
      : model.classes.map(c => generatePythonCode(c, model)).join('\n\n# ----------------------------------------\n\n');

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'mdl':
        return mdlContent;
      case 'ebs':
        return ebsContent;
      case 'xmi':
        return xmiContent;
      case 'plantuml':
        return plantUmlContent;
      case 'code':
        return codeContent;
      default:
        return '';
    }
  };

  const getFilename = () => {
    const base = model.systemName.replace(/[^a-zA-Z0-9]/g, '_') || 'RoseModel';
    switch (activeTab) {
      case 'mdl':
        return `${base}.mdl`;
      case 'ebs':
        return `${base}_Automation.ebs`;
      case 'xmi':
        return `${base}.xmi`;
      case 'plantuml':
        return `${base}.puml`;
      case 'code':
        return `${base}_Classes.${selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : 'py'}`;
    }
  };

  const handleDownload = () => {
    const content = getCurrentContent();
    const filename = getFilename();
    const mimeType = activeTab === 'xmi' ? 'application/xml' : 'text/plain';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdfInternal = async () => {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const svgEl = document.getElementById('diagram-svg') as unknown as SVGSVGElement | null;
      await generateUmlPdf(model, svgEl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl text-right">
      {/* Top Banner with Tutorial link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              بخش دانلود و خروجی مخصوص Rational Rose و گزارش PDF
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400">
              فرمت‌های رسمی برای بارگذاری در رشنال رویز و تحویل پروژه مهندسی نرم‌افزار
            </p>
          </div>
        </div>

        <button
          onClick={onOpenTutorial}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>آموزش تصویری باز کردن در Rational Rose</span>
        </button>
      </div>

      {/* Primary 3 Download Cards: .MDL, .EBS, and PDF Report */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
        {/* Card 1: .mdl */}
        <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 hover:border-rose-500 transition relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                مدل بومی رشنال رویز (.MDL)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Rose Petal</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">
              فایل اصلی مدل ({model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}.mdl)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">
              حاوی ساختار کامل Logical View، تعاریف کلاس‌ها، فیلدها و دیاگرام‌های گرافیکی.
              <br />
              <strong className="text-slate-300">نحوه استفاده:</strong> در Rose از منوی <code className="text-rose-300">File -&gt; Open</code> انتخاب کنید.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('mdl');
              const blob = new Blob([mdlContent], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}.mdl`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shadow-md shadow-rose-900/40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود فایل .MDL</span>
          </button>
        </div>

        {/* Card 2: .ebs Script */}
        <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 hover:border-indigo-500 transition relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                اسکریپت خودکار (.EBS)
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">۱۰۰٪ بدون خطا روی تمام نسخه‌ها</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">
              اسکریپت Rose Script (.ebs)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">
              کد ویژوال بیسیک اختصاصی موتور Rose Script که تمام کلاس‌ها و اتصالات را بدون خطای نسخه ایجاد می‌کند.
              <br />
              <strong className="text-slate-300">نحوه استفاده:</strong> در Rose به منوی <code className="text-indigo-300">Tools -&gt; Open Script</code> رفته و F5 را بزنید.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('ebs');
              const blob = new Blob([ebsContent], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}_Automation.ebs`;
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-900/40 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود اسکریپت .EBS</span>
          </button>
        </div>

        {/* Card 3: PDF Document Report */}
        <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40 hover:border-amber-500 transition relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                گزارش جامع مستندات (PDF)
              </span>
              <span className="text-[10px] text-amber-400 font-medium">ویژه گزارش کار و دانشگاه</span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-white mb-1">
              مستندات کامل معماری (PDF Report)
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed mb-3">
              شامل تصویر باکیفیت دیاگرام کلاس، جداول مشخصات تک‌تک فیلدها و متدها، ماتریس روابط و راهنمای کامل، آماده چاپ و ارائه به استاد.
            </p>
          </div>
          <button
            onClick={handleDownloadPdfInternal}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-semibold text-xs transition shadow-md shadow-amber-900/40 cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{isGeneratingPdf ? 'در حال ساخت فایل PDF...' : 'دانلود فایل کامل PDF'}</span>
          </button>
        </div>
      </div>

      {/* Tabs for code viewing */}
      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 mb-3 gap-2">
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setActiveTab('mdl')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'mdl'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              کد مدل (.mdl)
            </button>
            <button
              onClick={() => setActiveTab('ebs')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'ebs'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              اسکریپت Rose Script (.ebs)
            </button>
            <button
              onClick={() => setActiveTab('xmi')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'xmi'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فرمت XMI (.xmi)
            </button>
            <button
              onClick={() => setActiveTab('plantuml')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'plantuml'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              کد PlantUML
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              کد برنامه‌نویسی (Java/C++/Python)
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {activeTab === 'code' && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(['java', 'cpp', 'python'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase transition cursor-pointer ${
                      selectedLanguage === lang ? 'bg-slate-800 text-rose-300' : 'text-slate-400'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              title="کپی متن در حافظه"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد' : 'کپی'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
              title="دانلود فایل این تب"
            >
              <Download className="w-3.5 h-3.5" />
              <span>دانلود</span>
            </button>
          </div>
        </div>

        {/* Code Preview Box */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-left" dir="ltr">
          <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 font-mono text-slate-300">{getFilename()}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {getCurrentContent().split('\n').length} lines
            </span>
          </div>

          <pre className="p-4 text-xs text-slate-200 leading-relaxed overflow-x-auto max-h-72 select-text font-mono">
            <code>{getCurrentContent()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
