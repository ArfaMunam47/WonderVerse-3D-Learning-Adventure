import React, { useRef, useState, useEffect } from 'react';
import { audioService } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Palette,
  Eraser,
  Trash2,
  Download,
  Sparkles,
  ArrowLeft,
  Undo2,
  Redo2,
  PaintBucket,
  PenTool,
  Brush,
  Highlighter,
  Shapes,
  Smile
} from 'lucide-react';

interface CreativeCornerZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

type DrawTool = 'pencil' | 'brush' | 'marker' | 'crayon' | 'eraser' | 'fill' | 'shape' | 'stamp';
type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'cloud';

const PALETTE_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#FBBF24', // Warm Yellow
  '#10B981', // Emerald Green
  '#06B6D4', // Cyan
  '#3B82F6', // Sky Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#78350F', // Warm Brown
  '#D97706', // Amber
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#1F2937', // Charcoal
  '#FFFFFF'  // Pure White
];

const MEADOW_STAMPS = ['⭐', '🌸', '☀️', '🌈', '🍎', '🐰', '🦋', '🐥', '🎈', '🎵', '🌻', '❤️'];

export const CreativeCornerZone: React.FC<CreativeCornerZoneProps> = ({
  onEarnStar,
  onBack
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [brushSize, setBrushSize] = useState<number>(12);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<DrawTool>('brush');
  const [selectedShape, setSelectedShape] = useState<ShapeType>('star');
  const [selectedStamp, setSelectedStamp] = useState<string>('⭐');
  const [strokeCount, setStrokeCount] = useState<number>(0);

  // Undo/Redo history stack
  const historyRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Discard any future states if we were in the middle of undo
    historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
    historyRef.current.push(data);
    historyStepRef.current = historyRef.current.length - 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill clean warm white canvas initially
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  }, []);

  const handleUndo = () => {
    if (historyStepRef.current > 0) {
      historyStepRef.current -= 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
      audioService.playPop();
    }
  };

  const handleRedo = () => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyStepRef.current += 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(historyRef.current[historyStepRef.current], 0, 0);
      audioService.playPop();
    }
  };

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);

    if (activeTool === 'stamp') {
      ctx.font = `${brushSize * 4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, x, y);
      audioService.playPop();
      saveHistoryState();
      checkArtMilestone();
      return;
    }

    if (activeTool === 'shape') {
      ctx.fillStyle = selectedColor;
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize / 2;
      const r = brushSize * 3;

      if (selectedShape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (selectedShape === 'square') {
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      } else if (selectedShape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.lineTo(x - r, y + r);
        ctx.closePath();
        ctx.fill();
      } else if (selectedShape === 'star') {
        ctx.font = `${r * 2.2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', x, y);
      } else if (selectedShape === 'heart') {
        ctx.font = `${r * 2.2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', x, y);
      } else if (selectedShape === 'cloud') {
        ctx.font = `${r * 2.2}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☁️', x, y);
      }
      audioService.playPop();
      saveHistoryState();
      checkArtMilestone();
      return;
    }

    if (activeTool === 'fill') {
      // Fill canvas background
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      audioService.playPop();
      saveHistoryState();
      checkArtMilestone();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = brushSize * 2.5;
      ctx.globalAlpha = 1.0;
    } else if (activeTool === 'marker') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize * 1.8;
      ctx.globalAlpha = 0.55;
    } else if (activeTool === 'crayon') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize * 1.4;
      ctx.globalAlpha = 0.85;
    } else if (activeTool === 'pencil') {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = Math.max(3, brushSize * 0.4);
      ctx.globalAlpha = 1.0;
    } else {
      // Standard brush
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = 1.0;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || ['stamp', 'shape', 'fill'].includes(activeTool)) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.globalAlpha = 1.0;
      }
      saveHistoryState();
      checkArtMilestone();
    }
  };

  const checkArtMilestone = () => {
    const nextStrokes = strokeCount + 1;
    setStrokeCount(nextStrokes);
    if (nextStrokes === 12) {
      audioService.playSparkle();
      confetti({ particleCount: 50, spread: 70 });
      onEarnStar();
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    audioService.playPop();
    saveHistoryState();
  };

  const handleDownloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    audioService.playSuccess();
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'wonder-meadow-masterpiece.png';
    link.href = imageUri;
    link.click();
    confetti({ particleCount: 40, spread: 60 });
  };

  return (
    <div id="creative-corner-container" className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-[#FFFDF7] rounded-3xl shadow-xl border-2 border-amber-200/80">
      {/* Header with Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioService.playPop();
              onBack();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 font-extrabold transition-all text-sm shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>Back to Meadow</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-display font-black text-xl shadow-xs">
              🎨
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-black text-stone-900">
                Creative Corner
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Draw, paint, and add fun stickers!
              </p>
            </div>
          </div>
        </div>

        {/* Global Canvas Actions (Undo, Redo, Clear, Save) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            title="Undo"
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            title="Redo"
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearCanvas}
            title="Clear Canvas"
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-rose-100 border border-amber-200 text-stone-700 hover:text-rose-700 font-extrabold text-xs flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadArtwork}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Picture</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Studio Layout (Left Tools + Right Canvas) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Toolbar Sidebar */}
        <div className="lg:col-span-4 bg-[#FAF8F5] p-4 rounded-3xl border border-amber-200/80 space-y-4">
          {/* Drawing Tool Selector */}
          <div>
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-2">
              Select Tool:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'brush', label: 'Brush', icon: Brush },
                { id: 'pencil', label: 'Pencil', icon: PenTool },
                { id: 'marker', label: 'Marker', icon: Highlighter },
                { id: 'crayon', label: 'Crayon', icon: Palette },
                { id: 'eraser', label: 'Eraser', icon: Eraser },
                { id: 'fill', label: 'Bucket', icon: PaintBucket }
              ].map(tool => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id as DrawTool);
                      audioService.playPop();
                    }}
                    className={`py-2 px-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs font-extrabold transition-all cursor-pointer ${
                      activeTool === tool.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-[#FFFDF7] hover:bg-purple-50 text-stone-800 border border-amber-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brush Size Selector */}
          <div>
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-2">
              Brush Thickness:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { size: 6, label: 'Small' },
                { size: 14, label: 'Medium' },
                { size: 26, label: 'Large' }
              ].map(s => (
                <button
                  key={s.size}
                  onClick={() => {
                    setBrushSize(s.size);
                    audioService.playPop();
                  }}
                  className={`py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    brushSize === s.size
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-[#FFFDF7] text-stone-700 border border-amber-200'
                  }`}
                >
                  <span
                    className="rounded-full bg-current"
                    style={{ width: s.size / 2.2, height: s.size / 2.2 }}
                  />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Swatches (16 Palette Colors) */}
          <div>
            <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider block mb-2">
              Colors:
            </span>
            <div className="grid grid-cols-8 gap-1.5">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedColor(c);
                    if (activeTool === 'eraser') setActiveTool('brush');
                    audioService.playPop();
                  }}
                  className={`w-7 h-7 rounded-xl transition-transform border-2 cursor-pointer ${
                    selectedColor === c
                      ? 'ring-2 ring-purple-500 scale-110 border-white'
                      : 'border-stone-300/80 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Meadow Stamps / Shapes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-stone-600 uppercase tracking-wider">
                Stickers & Stamps:
              </span>
              <button
                onClick={() => {
                  setActiveTool('stamp');
                  audioService.playPop();
                }}
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg cursor-pointer ${
                  activeTool === 'stamp' ? 'bg-purple-600 text-white' : 'text-purple-700 bg-purple-50'
                }`}
              >
                Use Stamp
              </button>
            </div>
            <div className="grid grid-cols-6 gap-1.5 bg-[#FFFDF7] p-2 rounded-2xl border border-amber-200">
              {MEADOW_STAMPS.map((stamp) => (
                <button
                  key={stamp}
                  onClick={() => {
                    setSelectedStamp(stamp);
                    setActiveTool('stamp');
                    audioService.playPop();
                  }}
                  className={`text-xl p-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedStamp === stamp && activeTool === 'stamp'
                      ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                      : 'hover:bg-amber-50'
                  }`}
                >
                  {stamp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Canvas Workspace */}
        <div className="lg:col-span-8 bg-[#FAF8F5] p-3 rounded-3xl border-2 border-amber-200/80 shadow-inner flex flex-col items-center justify-center">
          <canvas
            ref={canvasRef}
            width={720}
            height={500}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full max-w-full aspect-[72/50] bg-white rounded-2xl shadow-md cursor-crosshair touch-none border border-amber-200/50"
          />
          <div className="w-full flex items-center justify-between px-2 pt-2 text-xs text-stone-600 font-medium">
            <span>✨ Tap and draw on the white board</span>
            <span>Lines Drawn: <b className="text-purple-700 font-black">{strokeCount}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};
