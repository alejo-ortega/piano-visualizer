import React, { useState, useEffect } from "react";
import Piano from "./components/Piano";
import Controls from "./components/Controls";
import SheetMusic from "./components/SheetMusic";
import {
  calculateActiveNotes,
  calculateDiatonicChords,
} from "./utils/musicTheory";
import {
  CHROMATIC_SCALE,
  MUSICAL_PATTERNS,
  NOTES_SHARP,
  NOTES_FLAT,
} from "./constants";
import { NoteName, ActiveNote, PatternCategory, DiatonicChord } from "./types";
import { initAudio, playChord, playScale } from "./utils/audio";

const App: React.FC = () => {
  const [selectedTonic, setSelectedTonic] = useState<NoteName>("C");
  const [mode, setMode] = useState<PatternCategory>(PatternCategory.CHORD);
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    MUSICAL_PATTERNS[0].id,
  );
  const [inversion, setInversion] = useState<number>(0);

  const [activeNotes, setActiveNotes] = useState<ActiveNote[]>([]);
  const [diatonicFormula, setDiatonicFormula] = useState<DiatonicChord[]>([]);
  const [previewNotes, setPreviewNotes] = useState<ActiveNote[] | null>(null);

  const updateVisualization = () => {
    const calculatedNotes = calculateActiveNotes(
      selectedTonic,
      selectedPatternId,
      inversion,
    );
    setActiveNotes(calculatedNotes);

    if (mode === PatternCategory.SCALE) {
      const chords = calculateDiatonicChords(calculatedNotes);
      setDiatonicFormula(chords);
    } else {
      setDiatonicFormula([]);
    }
  };

  const handlePlay = async () => {
    await initAudio();
    const sourceNotes = previewNotes || activeNotes;
    if (!sourceNotes.length) return;

    const pitchIndex = (note: NoteName) => {
      const sharpIdx = NOTES_SHARP.indexOf(note);
      if (sharpIdx !== -1) return sharpIdx;
      const flatIdx = NOTES_FLAT.indexOf(note as string);
      return flatIdx !== -1 ? flatIdx : 0;
    };

    if (mode === PatternCategory.SCALE && !previewNotes) {
      // Preserve scale order by interval, and drop duplicated top tonic if present
      const ordered = [...sourceNotes].sort((a, b) => a.interval - b.interval);
      const first = ordered[0];
      const last = ordered[ordered.length - 1];
      const firstPitch = first.octave * 12 + pitchIndex(first.note);
      const lastPitch = last.octave * 12 + pitchIndex(last.note);
      if (ordered.length > 1 && lastPitch - firstPitch === 12) {
        ordered.pop();
      }
      const notesToPlay = ordered.map((n) => n.toneNote);
      playScale(notesToPlay);
    } else {
      const notesToPlay = sourceNotes
        .sort(
          (a, b) =>
            a.octave * 12 +
            pitchIndex(a.note) -
            (b.octave * 12 + pitchIndex(b.note)),
        )
        .map((n) => n.toneNote);
      playChord(notesToPlay);
    }
  };

  const handleDiatonicClick = async (chord: DiatonicChord) => {
    await initAudio();
    const previewActiveNotes: ActiveNote[] = chord.chordNotes
      .map((toneNote, idx) => {
        const match = toneNote.match(/([A-G]#?)(\d)/);
        // Fallback logic for parsing flats if toneNote has them
        // toneNote comes from musicTheory and currently defaults to Sharp format for audio,
        // but if we change it later, this regex needs to be robust.
        // For now, DiatonicChord.chordNotes are generated via toneNote logic which uses Sharp/Natural.

        if (!match) return null;

        return {
          note: match[1] as NoteName,
          octave: parseInt(match[2]),
          interval: idx * 4,
          toneNote: toneNote,
          degreeLabel: idx === 0 ? "R" : idx === 1 ? "3" : "5",
          color: chord.color,
        };
      })
      .filter((n) => n !== null) as ActiveNote[];

    setPreviewNotes(previewActiveNotes);
    playChord(chord.chordNotes);
  };

  const clearPreview = () => setPreviewNotes(null);

  useEffect(() => {
    updateVisualization();
    setPreviewNotes(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTonic, selectedPatternId, inversion, mode]);

  return (
    <div
      className="min-h-screen flex flex-col items-center py-6 sm:px-6 max-w-7xl mx-auto font-sans"
      onClick={(e) => {
        if (previewNotes && !(e.target as HTMLElement).closest("button")) {
          clearPreview();
        }
      }}
    >
      <header className="mb-6 text-center w-full">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          Piano Visualizer
        </h1>
      </header>

      <div className="w-full flex flex-col gap-4 sm:gap-6 px-2 sm:px-0">
        <Controls
          selectedTonic={selectedTonic}
          setSelectedTonic={setSelectedTonic}
          selectedPattern={selectedPatternId}
          setSelectedPattern={setSelectedPatternId}
          inversion={inversion}
          setInversion={setInversion}
          onPlay={handlePlay}
          mode={mode}
          setMode={setMode}
        />

        <div className="w-full max-w-5xl mx-auto">
          <SheetMusic
            activeNotes={previewNotes || activeNotes}
            mode={mode}
            tonic={selectedTonic}
            patternId={selectedPatternId}
          />
        </div>

        <div className="w-full max-w-5xl mx-auto flex flex-col items-center min-h-[60px]">
          {previewNotes && (
            <div
              className="mb-3 text-xs font-bold text-blue-500 uppercase tracking-widest animate-pulse cursor-pointer hover:underline"
              onClick={clearPreview}
            >
              Previsualizando (Click para volver)
            </div>
          )}

          {/* FIXED: Horizontal Scroll Container for Mobile */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 items-center w-full hide-scrollbar px-2 sm:justify-center sm:flex-wrap">
            {mode === PatternCategory.SCALE &&
              diatonicFormula.length > 0 &&
              diatonicFormula.map((chord, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDiatonicClick(chord);
                  }}
                  className={`
                                h-10 px-4 rounded-full flex items-center gap-2 transition-all duration-200 flex-shrink-0
                                border border-slate-100 shadow-sm
                                hover:shadow-md active:scale-95 no-tap-highlight
                                ${previewNotes && previewNotes[0].note === chord.root ? "bg-slate-800 ring-2 ring-blue-500" : "bg-white"}
                            `}
                >
                  <span
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: chord.color }}
                  >
                    {chord.degree}
                  </span>
                  <div className="flex items-baseline gap-0.5">
                    <span
                      className={`text-sm font-bold ${previewNotes && previewNotes[0].note === chord.root ? "text-white" : "text-slate-700"}`}
                    >
                      {chord.root}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${previewNotes && previewNotes[0].note === chord.root ? "text-slate-300" : "text-slate-400"}`}
                    >
                      {chord.quality}
                    </span>
                  </div>
                </button>
              ))}

            {mode === PatternCategory.CHORD &&
              activeNotes.length > 0 &&
              activeNotes
                .sort(
                  (a, b) =>
                    a.octave * 12 +
                    CHROMATIC_SCALE.indexOf(a.note) -
                    (b.octave * 12 + CHROMATIC_SCALE.indexOf(b.note)),
                )
                .map((n, i) => (
                  <div
                    key={i}
                    className="h-10 px-4 rounded-full bg-white flex items-center gap-2 border border-slate-100 shadow-sm flex-shrink-0"
                  >
                    <span
                      className="text-[10px] font-black uppercase tracking-wider"
                      style={{ color: n.color }}
                    >
                      {n.degreeLabel}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {n.note}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto pb-10 sm:px-0 -mx-2 sm:mx-auto">
          <Piano
            tonic={selectedTonic}
            activeNotes={previewNotes || activeNotes}
          />
        </div>
      </div>

      <div className="text-neutral-400 text-sm">
        Hecho por <span className="font-medium">@juan_trifiro</span> y{" "}
        <span className="font-medium">@_alejo_ortega</span>
      </div>
    </div>
  );
};

export default App;
