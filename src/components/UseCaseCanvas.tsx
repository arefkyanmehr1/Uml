import React, { useState, useRef } from 'react';
import { UMLModel, UseCase, Actor } from '../types/uml';
import { ZoomIn, ZoomOut, Maximize2, Download } from 'lucide-react';

interface UseCaseCanvasProps {
  model: UMLModel;
}

export const UseCaseCanvas: React.FC<UseCaseCanvasProps> = ({ model }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'uc-bg') {
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
    link.download = `${model.systemName.replace(/[^a-zA-Z0-9]/g, '_')}_UseCaseDiagram.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Positions
  const actorPositions: Record<string, { x: number; y: number }> = {};
  model.actors.forEach((act, idx) => {
    actorPositions[act.name] = {
      x: 100,
      y: 120 + idx * 160,
    };
  });

  const boundaryX = 260;
  const boundaryY = 50;
  const boundaryWidth = 480;
  const boundaryHeight = Math.max(400, model.useCases.length * 90 + 70);

  const useCasePositions: Record<string, { x: number; y: number }> = {};
  model.useCases.forEach((uc, idx) => {
    useCasePositions[uc.name] = {
      x: boundaryX + boundaryWidth / 2,
      y: boundaryY + 80 + idx * 85,
    };
  });

  return (
    <div className="relative w-full h-[620px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl select-none flex flex-col">
      {/* Top Diagram Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg">
        <span className="text-xs font-semibold text-slate-300 pr-2 border-r border-slate-700 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Rational Rose Use Case View
        </span>

        <button
          onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 20, y: 20 }); }}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleExportSvg}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
          title="Export SVG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
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
              id="uc-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <polyline points="1 1, 8 5, 1 9" fill="none" stroke="#818cf8" strokeWidth="1.5" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            <rect id="uc-bg" x="-2000" y="-2000" width="6000" height="6000" fill="transparent" />

            {/* System Boundary Box */}
            <rect
              x={boundaryX}
              y={boundaryY}
              width={boundaryWidth}
              height={boundaryHeight}
              rx="12"
              fill="#0f172a"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="6,6"
            />
            {/* System Title */}
            <text
              x={boundaryX + boundaryWidth / 2}
              y={boundaryY + 30}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="14"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              {model.systemName}
            </text>

            {/* Actor to UseCase Lines */}
            {model.useCases.map((uc) => {
              const ucPos = useCasePositions[uc.name];
              if (!ucPos) return null;

              return uc.actors.map((actName, aIdx) => {
                const actPos = actorPositions[actName];
                if (!actPos) return null;

                return (
                  <line
                    key={`${uc.name}-${actName}-${aIdx}`}
                    x1={actPos.x + 25}
                    y1={actPos.y + 35}
                    x2={ucPos.x - 110}
                    y2={ucPos.y}
                    stroke="#64748b"
                    strokeWidth="1.5"
                  />
                );
              });
            })}

            {/* Actors (Stick Figures) */}
            {model.actors.map((act) => {
              const pos = actorPositions[act.name] || { x: 80, y: 100 };
              return (
                <g key={act.id || act.name} transform={`translate(${pos.x}, ${pos.y})`}>
                  {/* Head */}
                  <circle cx="0" cy="0" r="14" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  {/* Body */}
                  <line x1="0" y1="14" x2="0" y2="45" stroke="#38bdf8" strokeWidth="2" />
                  {/* Arms */}
                  <line x1="-22" y1="26" x2="22" y2="26" stroke="#38bdf8" strokeWidth="2" />
                  {/* Left Leg */}
                  <line x1="0" y1="45" x2="-18" y2="70" stroke="#38bdf8" strokeWidth="2" />
                  {/* Right Leg */}
                  <line x1="0" y1="45" x2="18" y2="70" stroke="#38bdf8" strokeWidth="2" />
                  {/* Label */}
                  <text
                    x="0"
                    y="88"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {act.name}
                  </text>
                  {act.description && (
                    <text
                      x="0"
                      y="102"
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                    >
                      {act.description.slice(0, 20)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Use Case Ellipses */}
            {model.useCases.map((uc) => {
              const pos = useCasePositions[uc.name] || { x: 450, y: 100 };
              return (
                <g key={uc.id || uc.name} transform={`translate(${pos.x}, ${pos.y})`} className="group cursor-pointer">
                  {/* Ellipse */}
                  <ellipse
                    rx="115"
                    ry="30"
                    className="fill-slate-900 stroke-indigo-500/70 group-hover:stroke-indigo-400 group-hover:fill-indigo-950/40 transition"
                    strokeWidth="1.8"
                  />
                  {/* Text */}
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="12"
                    fontWeight="500"
                    fontFamily="sans-serif"
                    className="pointer-events-none"
                  >
                    {uc.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
