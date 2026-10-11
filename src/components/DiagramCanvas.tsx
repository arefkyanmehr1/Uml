import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { UMLModel, UMLClass, Relationship } from '../types/uml';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileDown,
  LayoutGrid,
  Eye,
  Sparkles,
  Move,
  Layers,
  Check
} from 'lucide-react';
import { generateUmlPdf } from '../utils/pdfGenerator';

interface DiagramCanvasProps {
  model: UMLModel;
  onSelectClass: (cls: UMLClass) => void;
  onDownloadPdf?: () => void;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  model,
  onSelectClass,
  onDownloadPdf,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // View Mode: 'canvas' (interactive SVG) or 'grid' (responsive card grid)
  const [viewMode, setViewMode] = useState<'canvas' | 'grid'>('canvas');

  // Pan & Zoom state
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Touch handling for mobile
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const [touchStartPan, setTouchStartPan] = useState({ x: 0, y: 0 });

  // Node Positions (supports dragging to rearrange!)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Compute dimensions of each class box dynamically with generous padding
  const classDimensions = useMemo(() => {
    const dims: Record<string, { width: number; height: number }> = {};
    model.classes.forEach(cls => {
      // Find longest text to size box appropriately
      let maxLen = cls.name.length;
      cls.attributes.forEach(a => {
        const len = (a.name + a.type).length + 4;
        if (len > maxLen) maxLen = len;
      });
      cls.methods.forEach(m => {
        const paramStr = m.parameters.map(p => p.name).join(',');
        const len = (m.name + paramStr + m.returnType).length + 6;
        if (len > maxLen) maxLen = len;
      });

      // Box width: 280px minimum, up to 340px
      const width = Math.max(280, Math.min(350, maxLen * 7.5 + 40));
      const headerHeight = 46;
      const attrHeight = Math.max(28, cls.attributes.length * 22 + 14);
      const methodHeight = Math.max(28, cls.methods.length * 22 + 14);

      dims[cls.name] = {
        width,
        height: headerHeight + attrHeight + methodHeight,
      };
    });
    return dims;
  }, [model.classes]);

  // Auto-fit function to center and fit all classes in viewport
  const autoFitDiagram = useCallback(() => {
    if (!containerRef.current || model.classes.length === 0) return;

    const containerWidth = containerRef.current.clientWidth || 800;
    const containerHeight = containerRef.current.clientHeight || 550;

    // Determine layout: 2 or 3 columns
    const cols = containerWidth < 640 ? 1 : Math.max(2, Math.ceil(Math.sqrt(model.classes.length)));
    const colSpacing = 360;
    const rowSpacing = 320;

    const newPositions: Record<string, { x: number; y: number }> = {};

    // Sort classes: Parent/abstract classes first (top row)
    const sorted = [...model.classes].sort((a, b) => {
      const isAParent = model.relationships.some(r => r.target === a.name && r.type === 'inheritance');
      const isBParent = model.relationships.some(r => r.target === b.name && r.type === 'inheritance');
      if (isAParent && !isBParent) return -1;
      if (!isAParent && isBParent) return 1;
      return 0;
    });

    sorted.forEach((cls, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      newPositions[cls.name] = {
        x: 40 + col * colSpacing,
        y: 40 + row * rowSpacing,
      };
    });

    setPositions(newPositions);

    // Calculate total diagram width & height
    const rows = Math.ceil(model.classes.length / cols);
    const totalDiagramWidth = cols * colSpacing + 100;
    const totalDiagramHeight = rows * rowSpacing + 100;

    // Scale to fit container with nice margin
    const scaleX = (containerWidth - 40) / totalDiagramWidth;
    const scaleY = (containerHeight - 40) / totalDiagramHeight;
    const fitScale = Math.min(1.0, Math.max(0.35, Math.min(scaleX, scaleY)));

    setZoom(fitScale);
    setPan({
      x: Math.max(10, (containerWidth - totalDiagramWidth * fitScale) / 2),
      y: 25,
    });
  }, [model.classes, model.relationships]);

  // Run auto-fit on initial load or model change
  useEffect(() => {
    autoFitDiagram();
  }, [model.id, autoFitDiagram]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'diagram-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNode) {
      const newX = (e.clientX - pan.x) / zoom - dragOffset.x;
      const newY = (e.clientY - pan.y) / zoom - dragOffset.y;
      setPositions(prev => ({
        ...prev,
        [draggingNode]: { x: Math.max(10, newX), y: Math.max(10, newY) },
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
  };

  // Touch pan & pinch zoom handlers for mobile phones
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setStartPan({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
      setTouchStartPan({ ...pan });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - startPan.x,
        y: e.touches[0].clientY - startPan.y,
      });
    } else if (e.touches.length === 2 && touchStartDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDist;
      setZoom(prev => Math.min(2.5, Math.max(0.3, prev * (factor > 1 ? 1.02 : 0.98))));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setTouchStartDist(null);
  };

  // Node Drag handlers
  const startDragNode = (e: React.MouseEvent | React.TouchEvent, className: string) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const pos = positions[className] || { x: 0, y: 0 };
    const mouseX = (clientX - pan.x) / zoom;
    const mouseY = (clientY - pan.y) / zoom;
    setDragOffset({ x: mouseX - pos.x, y: mouseY - pos.y });
    setDraggingNode(className);
  };

  // Direct PDF Download Handler
  const handleDownloadPdf = async () => {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }
    setIsGeneratingPdf(true);
    try {
      await generateUmlPdf(model, svgRef.current);
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export SVG directly
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}_ClassDiagram.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render Relationship Path between Source & Target
  const renderRelationship = (rel: Relationship, idx: number) => {
    const srcPos = positions[rel.source];
    const tgtPos = positions[rel.target];
    const srcDim = classDimensions[rel.source] || { width: 280, height: 180 };
    const tgtDim = classDimensions[rel.target] || { width: 280, height: 180 };

    if (!srcPos || !tgtPos) return null;

    const srcCenterX = srcPos.x + srcDim.width / 2;
    const srcCenterY = srcPos.y + srcDim.height / 2;
    const tgtCenterX = tgtPos.x + tgtDim.width / 2;
    const tgtCenterY = tgtPos.y + tgtDim.height / 2;

    let startX = srcCenterX;
    let startY = srcCenterY;
    let endX = tgtCenterX;
    let endY = tgtCenterY;

    if (Math.abs(tgtCenterX - srcCenterX) > Math.abs(tgtCenterY - srcCenterY)) {
      if (tgtCenterX > srcCenterX) {
        startX = srcPos.x + srcDim.width;
        endX = tgtPos.x;
      } else {
        startX = srcPos.x;
        endX = tgtPos.x + tgtDim.width;
      }
    } else {
      if (tgtCenterY > srcCenterY) {
        startY = srcPos.y + srcDim.height;
        endY = tgtPos.y;
      } else {
        startY = srcPos.y;
        endY = tgtPos.y + tgtDim.height;
      }
    }

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    let strokeColor = '#94a3b8';
    let strokeDasharray = 'none';
    let markerEnd = 'url(#arrow-association)';
    let markerStart = 'none';

    if (rel.type === 'inheritance' || rel.type === 'realization') {
      strokeColor = '#38bdf8';
      markerEnd = 'url(#arrow-inheritance)';
      if (rel.type === 'realization') strokeDasharray = '5,5';
    } else if (rel.type === 'composition') {
      strokeColor = '#f43f5e';
      markerStart = 'url(#marker-composition)';
      markerEnd = 'none';
    } else if (rel.type === 'aggregation') {
      strokeColor = '#f59e0b';
      markerStart = 'url(#marker-aggregation)';
      markerEnd = 'none';
    } else if (rel.type === 'dependency') {
      strokeColor = '#a855f7';
      strokeDasharray = '4,4';
      markerEnd = 'url(#arrow-dependency)';
    }

    return (
      <g key={rel.id || idx} style={{ direction: 'ltr' }}>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={strokeColor}
          strokeWidth="2"
          strokeDasharray={strokeDasharray}
          markerStart={markerStart}
          markerEnd={markerEnd}
        />

        {/* Semantic Label */}
        {rel.label && (
          <g transform={`translate(${midX}, ${midY})`}>
            <rect
              x="-45"
              y="-11"
              width="90"
              height="22"
              rx="4"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="1"
            />
            <text
              x="0"
              y="4"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="10"
              fontFamily="sans-serif"
            >
              {rel.label}
            </text>
          </g>
        )}

        {/* Source Multiplicity */}
        {rel.sourceMultiplicity && (
          <text
            x={startX + (tgtCenterX > srcCenterX ? 16 : -16)}
            y={startY + (tgtCenterY > srcCenterY ? 16 : -12)}
            fill="#cbd5e1"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {rel.sourceMultiplicity}
          </text>
        )}

        {/* Target Multiplicity */}
        {rel.targetMultiplicity && (
          <text
            x={endX + (tgtCenterX > srcCenterX ? -20 : 16)}
            y={endY + (tgtCenterY > srcCenterY ? -12 : 18)}
            fill="#cbd5e1"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {rel.targetMultiplicity}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="relative w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Diagram Toolbar - Fully Responsive */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Rational Rose Class View</span>
            <span className="sm:hidden">کلاس‌ها</span>
          </div>

          {/* Toggle View Mode (Canvas vs Grid) */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                viewMode === 'canvas' ? 'bg-slate-800 text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
              title="بوم گرافیکی تعاملی"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">بوم گرافیکی</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-800 text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
              title="نمای جدولی منظم (کارت‌ها)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">نمای جدولی</span>
            </button>
          </div>
        </div>

        {/* Action Controls & PDF Download */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          {viewMode === 'canvas' && (
            <>
              <button
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="بزرگ‌نمایی (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.3, prev - 0.1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="کوچک‌نمایی (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={autoFitDiagram}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-medium"
                title="تنظیم خودکار با اندازه صفحه (Fit to Screen)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">تنظیم کادر</span>
              </button>
            </>
          )}

          {/* Glowing PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-rose-900/40 transition cursor-pointer disabled:opacity-50"
            title="دانلود مستندات کامل و دیاگرام به فرمت PDF بسیار شیک و خوانا"
          >
            {isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>در حال ساخت PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>دانلود گزارش PDF</span>
              </>
            )}
          </button>

          {viewMode === 'canvas' && (
            <button
              onClick={handleExportSvg}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="دانلود فایل SVG دیاگرام"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Either Interactive Canvas OR Responsive Card Grid */}
      {viewMode === 'canvas' ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] cursor-grab active:cursor-grabbing overflow-hidden bg-slate-950"
          style={{ direction: 'ltr' }}
        >
          <svg
            ref={svgRef}
            id="diagram-svg"
            className="w-full h-full"
            style={{
              direction: 'ltr',
              unicodeBidi: 'isolate',
              backgroundImage: 'radial-gradient(#334155 0.75px, transparent 0.75px)',
              backgroundSize: '24px 24px',
            }}
          >
            <defs>
              {/* Inheritance Hollow Arrow */}
              <marker
                id="arrow-inheritance"
                viewBox="0 0 12 12"
                refX="10"
                refY="6"
                markerWidth="10"
                markerHeight="10"
                orient="auto-start-reverse"
              >
                <polygon points="0 1, 10 6, 0 11" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
              </marker>

              {/* Association Arrow */}
              <marker
                id="arrow-association"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <polyline points="1 1, 8 5, 1 9" fill="none" stroke="#94a3b8" strokeWidth="1.8" />
              </marker>

              {/* Dependency Open Arrow */}
              <marker
                id="arrow-dependency"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <polyline points="1 1, 8 5, 1 9" fill="none" stroke="#a855f7" strokeWidth="1.8" />
              </marker>

              {/* Composition Filled Diamond */}
              <marker
                id="marker-composition"
                viewBox="0 0 16 16"
                refX="8"
                refY="8"
                markerWidth="12"
                markerHeight="12"
                orient="auto"
              >
                <polygon points="0 8, 8 2, 16 8, 8 14" fill="#f43f5e" stroke="#f43f5e" strokeWidth="1" />
              </marker>

              {/* Aggregation Hollow Diamond */}
              <marker
                id="marker-aggregation"
                viewBox="0 0 16 16"
                refX="8"
                refY="8"
                markerWidth="12"
                markerHeight="12"
                orient="auto"
              >
                <polygon points="0 8, 8 2, 16 8, 8 14" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.8" />
              </marker>

              {/* ClipPaths for each class to prevent any overflowing */}
              {model.classes.map(cls => {
                const dim = classDimensions[cls.name] || { width: 280, height: 180 };
                return (
                  <clipPath key={`clip-${cls.name}`} id={`clip-${cls.name}`}>
                    <rect width={dim.width} height={dim.height} rx="8" />
                  </clipPath>
                );
              })}
            </defs>

            {/* Root Transform Group */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ direction: 'ltr' }}>
              <rect id="diagram-bg" x="-3000" y="-3000" width="10000" height="10000" fill="transparent" />

              {/* Render Relationships */}
              {model.relationships.map((rel, idx) => renderRelationship(rel, idx))}

              {/* Render Classes */}
              {model.classes.map((cls) => {
                const pos = positions[cls.name] || { x: 50, y: 50 };
                const dim = classDimensions[cls.name] || { width: 280, height: 180 };
                const headerHeight = 46;
                const attrHeight = Math.max(28, cls.attributes.length * 22 + 14);

                return (
                  <g
                    key={cls.id || cls.name}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-move group"
                    style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                    onMouseDown={(e) => startDragNode(e, cls.name)}
                    onTouchStart={(e) => startDragNode(e, cls.name)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClass(cls);
                    }}
                  >
                    {/* Shadow / Outer Box */}
                    <rect
                      width={dim.width}
                      height={dim.height}
                      rx="8"
                      className="fill-slate-900 stroke-slate-700/90 group-hover:stroke-rose-500 transition shadow-2xl"
                      strokeWidth="2"
                    />

                    {/* Header Compartment */}
                    <rect
                      width={dim.width}
                      height={headerHeight}
                      rx="8"
                      className="fill-slate-800/95"
                    />
                    <rect
                      y={headerHeight - 6}
                      width={dim.width}
                      height={6}
                      className="fill-slate-800/95"
                    />
                    <line
                      x1="0"
                      y1={headerHeight}
                      x2={dim.width}
                      y2={headerHeight}
                      stroke="#334155"
                      strokeWidth="1.5"
                    />

                    {/* Stereotype */}
                    {cls.stereotype && (
                      <text
                        x={dim.width / 2}
                        y="16"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        letterSpacing="0.05em"
                        style={{ direction: 'ltr' }}
                      >
                        &lt;&lt;{cls.stereotype}&gt;&gt;
                      </text>
                    )}

                    {/* Class Name */}
                    <text
                      x={dim.width / 2}
                      y={cls.stereotype ? 35 : 28}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="group-hover:fill-rose-400 transition"
                      style={{ direction: 'ltr' }}
                    >
                      {cls.name}
                    </text>

                    {/* Attributes Compartment */}
                    <g transform={`translate(10, ${headerHeight + 8})`} style={{ direction: 'ltr' }}>
                      {cls.attributes.length === 0 ? (
                        <text y="14" fill="#64748b" fontSize="11" fontStyle="italic">
                          (no attributes)
                        </text>
                      ) : (
                        cls.attributes.map((attr, aIdx) => {
                          const sym = attr.visibility === 'public' ? '+' : attr.visibility === 'protected' ? '#' : '-';
                          const color = attr.visibility === 'public' ? '#34d399' : attr.visibility === 'protected' ? '#fbbf24' : '#f87171';
                          return (
                            <g key={aIdx} transform={`translate(0, ${aIdx * 22})`} style={{ direction: 'ltr' }}>
                              <text
                                x="0"
                                y="14"
                                fill={color}
                                fontSize="12"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {sym}
                              </text>
                              <text
                                x="14"
                                y="14"
                                fill="#e2e8f0"
                                fontSize="11"
                                fontFamily="monospace"
                              >
                                {attr.name.length > 20 ? attr.name.slice(0, 18) + '..' : attr.name}
                              </text>
                              <text
                                x={dim.width - 24}
                                y="14"
                                textAnchor="end"
                                fill="#94a3b8"
                                fontSize="11"
                                fontFamily="monospace"
                              >
                                : {attr.type}
                              </text>
                            </g>
                          );
                        })
                      )}
                    </g>

                    {/* Divider line between Attributes and Methods */}
                    <line
                      x1="0"
                      y1={headerHeight + attrHeight}
                      x2={dim.width}
                      y2={headerHeight + attrHeight}
                      stroke="#334155"
                      strokeWidth="1.5"
                    />

                    {/* Methods Compartment */}
                    <g transform={`translate(10, ${headerHeight + attrHeight + 8})`} style={{ direction: 'ltr' }}>
                      {cls.methods.length === 0 ? (
                        <text y="14" fill="#64748b" fontSize="11" fontStyle="italic">
                          (no methods)
                        </text>
                      ) : (
                        cls.methods.map((m, mIdx) => {
                          const sym = m.visibility === 'public' ? '+' : m.visibility === 'protected' ? '#' : '-';
                          const color = m.visibility === 'public' ? '#34d399' : m.visibility === 'protected' ? '#fbbf24' : '#f87171';
                          const params = m.parameters.map(p => p.name).join(',');
                          const fullSig = `${m.name}(${params})`;
                          const displaySig = fullSig.length > 22 ? fullSig.slice(0, 20) + '..)' : fullSig;

                          return (
                            <g key={mIdx} transform={`translate(0, ${mIdx * 22})`} style={{ direction: 'ltr' }}>
                              <text
                                x="0"
                                y="14"
                                fill={color}
                                fontSize="12"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {sym}
                              </text>
                              <text
                                x="14"
                                y="14"
                                fill="#f1f5f9"
                                fontSize="11"
                                fontFamily="monospace"
                              >
                                {displaySig}
                              </text>
                              <text
                                x={dim.width - 24}
                                y="14"
                                textAnchor="end"
                                fill="#38bdf8"
                                fontSize="11"
                                fontFamily="monospace"
                              >
                                : {m.returnType}
                              </text>
                            </g>
                          );
                        })
                      )}
                    </g>

                    {/* Edit pen indicator */}
                    <circle
                      cx={dim.width - 16}
                      cy="16"
                      r="9"
                      className="fill-slate-700/80 group-hover:fill-rose-600 transition"
                    />
                    <text
                      x={dim.width - 16}
                      y="20"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      className="pointer-events-none"
                    >
                      ✎
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Quick Helper Overlay */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>با کشیدن ماوس جابجا کنید • روی هر کلاس برای ویرایش کلیک کنید</span>
          </div>
        </div>
      ) : (
        /* Structured Clean Responsive Grid View (Perfect for mobile screens!) */
        <div className="p-4 sm:p-6 bg-slate-950 overflow-y-auto max-h-[680px]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              جدول ساختاریافته و ریسپانسیو کلاس‌های تولید شده (بدون درهم‌ریختگی روی گوشی):
            </p>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              {model.classes.length} کلاس تعریف شده
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {model.classes.map((cls) => (
              <div
                key={cls.id || cls.name}
                onClick={() => onSelectClass(cls)}
                className="bg-slate-900 border border-slate-800 hover:border-rose-500/60 rounded-xl overflow-hidden shadow-lg transition cursor-pointer flex flex-col justify-between group"
              >
                {/* Header */}
                <div className="bg-slate-850 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    {cls.stereotype && (
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        &lt;&lt;{cls.stereotype}&gt;&gt;
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-white group-hover:text-rose-400 font-mono transition" dir="ltr">
                      {cls.name}
                    </h3>
                  </div>
                  <button className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded bg-slate-800/80">
                    ویرایش ✎
                  </button>
                </div>

                {/* Attributes Compartment */}
                <div className="p-3 border-b border-slate-800/60">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    فیلدها (Attributes):
                  </span>
                  {cls.attributes.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">بدون فیلد</span>
                  ) : (
                    <div className="space-y-1 font-mono text-xs" dir="ltr">
                      {cls.attributes.map((attr, aIdx) => (
                        <div key={aIdx} className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className={attr.visibility === 'public' ? 'text-emerald-400 font-bold' : attr.visibility === 'protected' ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                              {attr.visibility === 'public' ? '+' : attr.visibility === 'protected' ? '#' : '-'}
                            </span>
                            <span>{attr.name}</span>
                          </span>
                          <span className="text-slate-500 text-[11px]">: {attr.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Methods Compartment */}
                <div className="p-3 bg-slate-900/50 flex-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    متدها و عملیات (Methods):
                  </span>
                  {cls.methods.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">بدون متد</span>
                  ) : (
                    <div className="space-y-1 font-mono text-xs" dir="ltr">
                      {cls.methods.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center justify-between text-slate-200">
                          <span className="flex items-center gap-1.5 truncate">
                            <span className={m.visibility === 'public' ? 'text-emerald-400 font-bold' : m.visibility === 'protected' ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                              {m.visibility === 'public' ? '+' : m.visibility === 'protected' ? '#' : '-'}
                            </span>
                            <span className="truncate">{m.name}({m.parameters.map(p => p.name).join(',')})</span>
                          </span>
                          <span className="text-sky-400 text-[11px] shrink-0">: {m.returnType}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connected Relationships footer */}
                <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>
                    روابط: {model.relationships.filter(r => r.source === cls.name || r.target === cls.name).length} ارتباط
                  </span>
                  <span className="text-slate-500">جهت ویرایش کلیک کنید</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
