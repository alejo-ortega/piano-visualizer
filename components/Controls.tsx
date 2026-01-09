import React from "react";
import { CHROMATIC_SCALE, MUSICAL_PATTERNS } from "../constants";
import { NoteName, PatternCategory } from "../types";

interface ControlsProps {
  selectedTonic: NoteName;
  setSelectedTonic: (n: NoteName) => void;
  selectedPattern: string;
  setSelectedPattern: (p: string) => void;
  inversion: number;
  setInversion: (n: number) => void;
  onPlay: () => void;
  mode: PatternCategory;
  setMode: (m: PatternCategory) => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedTonic,
  setSelectedTonic,
  selectedPattern,
  setSelectedPattern,
  inversion,
  setInversion,
  onPlay,
  mode,
  setMode,
}) => {
  const currentPatterns = MUSICAL_PATTERNS.filter((p) => p.category === mode);

  const handleModeChange = (newMode: PatternCategory) => {
    setMode(newMode);
    const firstPattern = MUSICAL_PATTERNS.find((p) => p.category === newMode);
    if (firstPattern) {
      setSelectedPattern(firstPattern.id);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 items-start justify-between mb-2">
      {/* LEFT: Matrix Card */}
      <div className="w-full lg:flex-1 card-floating p-6">
        <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
          Nota Tónica
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {CHROMATIC_SCALE.map((note) => {
            const isActive = selectedTonic === note;
            return (
              <button
                key={note}
                onClick={() => setSelectedTonic(note)}
                className={`
                          h-10 w-full rounded-xl text-sm font-semibold transition-all duration-300
                          flex items-center justify-center no-tap-highlight
                          ${
                            isActive
                              ? "bg-[#2D3436] text-white shadow-lg shadow-black/10 transform scale-105"
                              : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          }
                      `}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Config Card */}
      <div className="w-full lg:w-[380px] card-floating p-6 flex flex-col gap-6">
        {/* Segmented Control */}
        <div>
          <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
            Categoría
          </label>
          <div className="bg-slate-100 p-1.5 rounded-xl flex relative">
            <button
              onClick={() => handleModeChange(PatternCategory.CHORD)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 no-tap-highlight ${mode === PatternCategory.CHORD ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              ACORDES
            </button>
            <button
              onClick={() => handleModeChange(PatternCategory.SCALE)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 no-tap-highlight ${mode === PatternCategory.SCALE ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              ESCALAS
            </button>
          </div>
        </div>

        {/* Selectors Row */}
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Tipo
            </label>
            <div className="relative inline-block w-full">
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full appearance-none bg-transparent text-lg font-bold text-slate-700 border-b border-slate-200 py-2 pr-6 focus:outline-none focus:border-[#98C1D9] transition-colors cursor-pointer"
              >
                {currentPatterns.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {/* Chevron */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {mode === PatternCategory.CHORD && (
            <div className="w-1/3 relative group animate-fade-in">
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                Inv.
              </label>
              <div className="relative inline-block w-full">
                <select
                  value={inversion}
                  onChange={(e) => setInversion(Number(e.target.value))}
                  className="w-full appearance-none bg-transparent text-lg font-bold text-slate-700 border-b border-slate-200 py-2 pr-6 focus:outline-none focus:border-[#98C1D9] transition-colors cursor-pointer"
                >
                  <option value={0}>Fund.</option>
                  <option value={1}>1ª</option>
                  <option value={2}>2ª</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-slate-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Play Button */}
        <button
          onClick={onPlay}
          className="
                    w-full py-4 rounded-xl 
                    bg-gradient-to-r from-[#98C1D9] to-[#9BF6FF]
                    text-slate-800 shadow-[0_10px_20px_-5px_rgba(152,193,217,0.5)]
                    flex items-center justify-center gap-2
                    transition-all duration-300 ease-out
                    active:scale-[0.98]
                    hover:shadow-xl hover:shadow-[#98C1D9]/40
                    no-tap-highlight group
                "
        >
          <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg
              className="w-4 h-4 ml-0.5 text-slate-800"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">
            Escuchar
          </span>
        </button>
      </div>
    </div>
  );
};

export default Controls;
