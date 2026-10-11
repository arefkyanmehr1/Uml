import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Flowchart, FlowchartNode, FlowchartEdge } from '../types/uml';
import { ZoomIn, ZoomOut, Maximize2, Download, GitCommit, Info, CheckCircle2 } from 'lucide-react';

interface FlowchartCanvasProps {
  flowchart?: Flowchart;
  systemName: string;
}

export const FlowchartCanvas: React.FC<FlowchartCanvasProps> = ({ flowchart, systemName }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null);

  // If no flowchart generated yet, build a clean sensible fallback workflow
  const currentFlowchart: Flowchart = useMemo(() => {
    if (flowchart && flowchart.nodes && flowchart.nodes.length > 0) {
      return flowchart;
    }
    return {
      title: `فلوچارت فرآیند عملیاتی ${systemName}`,
      description: 'گردش کار خودکار گام‌به‌گام از شروع سناریو تا پردازش، بررسی شروط و اتمام فرآیند.',
      nodes: [
        { id: 'n1', type: 'start', label: 'شروع فرآیند', description: 'ورود به سامانه و آغاز درخواست' },
        { id: 'n2', type: 'process', label: 'دریافت و اعتبارسنجی اطلاعات', description: 'بررسی مقادیر ورودی و فرمت داده‌ها' },
        { id: 'n3', type: 'decision', label: 'آیا داده‌ها و شروط معتبر هستند؟', description: 'بررسی صحت احراز هویت و دسترسی کاربر' },
        { id: 'n4', type: 'process', label: 'انجام عملیات و پردازش هسته', description: 'ثبت در پایگاه داده و اعمال منطق تجاری' },
        { id: 'n5', type: 'process', label: 'ارسال اعلان خطا و هشدار', description: 'اعلام نقص در ورودی به کاربر' },
        { id: 'n6', type: 'end', label: 'پایان موفقیت‌آمیز', description: 'صدور تاییدیه نهایی و ذخیره‌سازی وضعیت' }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: 'بله' },
        { id: 'e4', source: 'n3', target: 'n5', label: 'خیر' },
        { id: 'e5', source: 'n5', target: 'n2', label: 'ویرایش' },
        { id: 'e6', source: 'n4', target: 'n6' }
      ]
    };
  }, [flowchart, systemName]);

  // Compute node coordinates in a clean vertical flowchart layout
  const layoutNodes = useMemo(() => {
    const nodes = currentFlowchart.nodes;
    const nodeMap: Record<string, { x: number; y: number; width: number; height: number; node: FlowchartNode }> = {};

    const startX = 350;
    let currentY = 50;

    nodes.forEach((n, idx) => {
      let width = 240;
      let height = 70;

      if (n.type === 'start' || n.type === 'end') {
        width = 180;
        height = 54;
      } else if (n.type === 'decision') {
        width = 230;
        height = 90;
      }

      // Branching layout: if decision alternative, offset slightly
      let posX = startX;
      if (n.label.includes('خطا') || n.label.includes('ناموفق')) {
        posX = startX + 280;
      }

      nodeMap[n.id] = {
        x: posX,
        y: currentY,
        width,
        height,
        node: n,
      };

      if (!n.label.includes('خطا') && !n.label.includes('ناموفق')) {
        currentY += height + 55;
      }
    });

    return nodeMap;
  }, [currentFlowchart]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'fc-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${systemName.replace(/[^a-zA-Z0-9]/g, '_')}_Flowchart.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col" dir="rtl">
      {/* Top Flowchart Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300">
            <GitCommit className="w-4 h-4" />
            <span>{currentFlowchart.title || 'فلوچارت خودکار فرآیند'}</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            طراحی استاندارد بر اساس نیازمندی‌ها
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="بزرگ‌نمایی"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="کوچک‌نمایی"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoom(0.85); setPan({ x: 30, y: 30 }); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="بازنشانی کادر"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportSvg}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
            title="دانلود فایل SVG فلوچارت"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود SVG</span>
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-[520px] sm:h-[620px] cursor-grab active:cursor-grabbing overflow-hidden bg-slate-950"
      >
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(#334155 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px',
          }}
        >
          <defs>
            <marker
              id="fc-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <polyline points="1 1, 8 5, 1 9" fill="none" stroke="#38bdf8" strokeWidth="1.8" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <rect id="fc-bg" x="-3000" y="-3000" width="10000" height="10000" fill="transparent" />

            {/* Render Flowchart Edges */}
            {currentFlowchart.edges.map((edge) => {
              const src = layoutNodes[edge.source];
              const tgt = layoutNodes[edge.target];
              if (!src || !tgt) return null;

              const startX = src.x;
              const startY = src.y + src.height / 2;
              const endX = tgt.x;
              const endY = tgt.y - tgt.height / 2;

              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              return (
                <g key={edge.id}>
                  {/* Line */}
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    markerEnd="url(#fc-arrow)"
                  />
                  {/* Edge Label (e.g. بله / خیر) */}
                  {edge.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-30"
                        y="-10"
                        width="60"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#fde047"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="Vazirmatn, sans-serif"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Flowchart Nodes */}
            {Object.values(layoutNodes).map(({ x, y, width, height, node }) => {
              const isSelected = selectedNode?.id === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${x}, ${y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Shape based on Type */}
                  {node.type === 'start' && (
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      rx={height / 2}
                      className="fill-emerald-950/80 stroke-emerald-500 hover:fill-emerald-900 transition shadow-lg"
                      strokeWidth={isSelected ? 3 : 2}
                    />
                  )}

                  {node.type === 'end' && (
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      rx={height / 2}
                      className="fill-rose-950/80 stroke-rose-500 hover:fill-rose-900 transition shadow-lg"
                      strokeWidth={isSelected ? 3 : 2}
                    />
                  )}

                  {node.type === 'decision' && (
                    <polygon
                      points={`0,${-height / 2} ${width / 2},0 0,${height / 2} ${-width / 2},0`}
                      className="fill-amber-950/80 stroke-amber-400 hover:fill-amber-900 transition shadow-lg"
                      strokeWidth={isSelected ? 3 : 2}
                    />
                  )}

                  {node.type === 'process' && (
                    <rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      rx="8"
                      className="fill-slate-900 stroke-sky-500/80 hover:stroke-sky-400 hover:fill-slate-850 transition shadow-lg"
                      strokeWidth={isSelected ? 3 : 1.8}
                    />
                  )}

                  {/* Node Label Text */}
                  <text
                    x="0"
                    y={node.type === 'decision' ? -6 : node.description ? -6 : 4}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="Vazirmatn, sans-serif"
                    className="pointer-events-none"
                  >
                    {node.label}
                  </text>

                  {/* Subtext description */}
                  {node.description && node.type !== 'decision' && (
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="Vazirmatn, sans-serif"
                      className="pointer-events-none"
                    >
                      {node.description.length > 30 ? node.description.slice(0, 28) + '...' : node.description}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Details Drawer at bottom */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3.5 shadow-2xl flex items-center justify-between text-right animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white mb-0.5">
                  گام: {selectedNode.label}
                </h4>
                <p className="text-xs text-slate-300">
                  {selectedNode.description || 'توضیحات تکمیلی برای این مرحله از جریان فرآیند نرم‌افزار.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer shrink-0"
            >
              بستن
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
