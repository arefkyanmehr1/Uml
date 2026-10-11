import React, { useState } from 'react';
import { UMLClass, Attribute, Method, Visibility, Stereotype } from '../types/uml';
import { X, Plus, Trash2, Check, Shield, Code, Settings } from 'lucide-react';

interface ClassDetailModalProps {
  cls: UMLClass | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClass: UMLClass) => void;
  onDeleteClass?: (className: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  cls,
  isOpen,
  onClose,
  onSave,
  onDeleteClass,
}) => {
  if (!isOpen || !cls) return null;

  const [name, setName] = useState(cls.name);
  const [stereotype, setStereotype] = useState<Stereotype>(cls.stereotype || 'standard');
  const [description, setDescription] = useState(cls.description || '');
  const [attributes, setAttributes] = useState<Attribute[]>([...cls.attributes]);
  const [methods, setMethods] = useState<Method[]>([...cls.methods]);

  // Form states for new attribute
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('String');
  const [newAttrVis, setNewAttrVis] = useState<Visibility>('private');

  // Form states for new method
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodReturn, setNewMethodReturn] = useState('void');
  const [newMethodVis, setNewMethodVis] = useState<Visibility>('public');

  const handleAddAttribute = () => {
    if (!newAttrName.trim()) return;
    setAttributes(prev => [
      ...prev,
      {
        name: newAttrName.trim(),
        type: newAttrType.trim() || 'String',
        visibility: newAttrVis,
      },
    ]);
    setNewAttrName('');
  };

  const handleRemoveAttribute = (idx: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddMethod = () => {
    if (!newMethodName.trim()) return;
    setMethods(prev => [
      ...prev,
      {
        name: newMethodName.trim(),
        returnType: newMethodReturn.trim() || 'void',
        visibility: newMethodVis,
        parameters: [],
      },
    ]);
    setNewMethodName('');
  };

  const handleRemoveMethod = (idx: number) => {
    setMethods(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    onSave({
      ...cls,
      name: name.trim() || cls.name,
      stereotype,
      description,
      attributes,
      methods,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs">
              {cls.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                مشخصات و ویرایش کلاس {cls.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                تنظیم خصوصیات، متدها و استریوتایپ برای بازتاب مستقیم در مدل رشنال رویز
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

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* General Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                نام کلاس (انگلیسی بدون فاصله)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 font-mono text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                استریوتایپ (Stereotype)
              </label>
              <select
                value={stereotype}
                onChange={(e) => setStereotype(e.target.value as Stereotype)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs focus:border-rose-500 focus:outline-none"
              >
                <option value="standard">استاندارد (Standard Class)</option>
                <option value="entity">&lt;&lt;entity&gt;&gt; (موجودیت داده‌ای)</option>
                <option value="control">&lt;&lt;control&gt;&gt; (منطق و کنترل‌کننده)</option>
                <option value="boundary">&lt;&lt;boundary&gt;&gt; (واسط کاربری یا وب‌سرویس)</option>
                <option value="abstract">&lt;&lt;abstract&gt;&gt; (کلاس تجریدی)</option>
                <option value="interface">&lt;&lt;interface&gt;&gt; (اینترفیس)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              شرح کلاس در مستندات مهندسی نرم‌افزار
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 text-xs focus:border-rose-500 focus:outline-none resize-none"
            />
          </div>

          {/* Attributes Section */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                فیلدها و صفات (Attributes)
              </span>
              <span className="text-[11px] text-slate-500">{attributes.length} فیلد</span>
            </div>

            {/* Attributes list */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {attributes.map((attr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 font-mono" dir="ltr">
                    <span
                      className={`font-bold ${
                        attr.visibility === 'public'
                          ? 'text-emerald-400'
                          : attr.visibility === 'protected'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {attr.visibility === 'public' ? '+' : attr.visibility === 'protected' ? '#' : '-'}
                    </span>
                    <span className="text-white font-medium">{attr.name}</span>
                    <span className="text-slate-400">: {attr.type}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveAttribute(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="حذف فیلد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Attribute input */}
            <div className="grid grid-cols-12 gap-2 pt-1" dir="ltr">
              <select
                value={newAttrVis}
                onChange={(e) => setNewAttrVis(e.target.value as Visibility)}
                className="col-span-3 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 focus:outline-none"
              >
                <option value="private">- private</option>
                <option value="public">+ public</option>
                <option value="protected"># protected</option>
              </select>
              <input
                type="text"
                placeholder="attributeName"
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
                className="col-span-5 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Type (e.g. String)"
                value={newAttrType}
                onChange={(e) => setNewAttrType(e.target.value)}
                className="col-span-3 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddAttribute}
                className="col-span-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition"
                title="افزودن فیلد"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Methods Section */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                متدها و عملیات (Operations / Methods)
              </span>
              <span className="text-[11px] text-slate-500">{methods.length} متد</span>
            </div>

            {/* Methods list */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {methods.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 font-mono" dir="ltr">
                    <span
                      className={`font-bold ${
                        m.visibility === 'public'
                          ? 'text-emerald-400'
                          : m.visibility === 'protected'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {m.visibility === 'public' ? '+' : m.visibility === 'protected' ? '#' : '-'}
                    </span>
                    <span className="text-white font-medium">{m.name}()</span>
                    <span className="text-sky-400">: {m.returnType}</span>
                  </div>

                  <button
                    onClick={() => handleRemoveMethod(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                    title="حذف متد"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Method input */}
            <div className="grid grid-cols-12 gap-2 pt-1" dir="ltr">
              <select
                value={newMethodVis}
                onChange={(e) => setNewMethodVis(e.target.value as Visibility)}
                className="col-span-3 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 focus:outline-none"
              >
                <option value="public">+ public</option>
                <option value="private">- private</option>
                <option value="protected"># protected</option>
              </select>
              <input
                type="text"
                placeholder="methodName"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                className="col-span-5 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Return (void)"
                value={newMethodReturn}
                onChange={(e) => setNewMethodReturn(e.target.value)}
                className="col-span-3 bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMethod}
                className="col-span-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition"
                title="افزودن متد"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {onDeleteClass && (
            <button
              onClick={() => {
                if (confirm(`آیا از حذف کلاس ${cls.name} اطمینان دارید؟`)) {
                  onDeleteClass(cls.name);
                  onClose();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 transition"
            >
              حذف این کلاس از مدل
            </button>
          )}

          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs transition"
            >
              انصراف
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/30 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>ذخیره تغییرات در مدل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
