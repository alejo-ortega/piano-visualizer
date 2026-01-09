import {
  NOTES_SHARP,
  NOTES_FLAT,
  CHROMATIC_SCALE,
  MUSICAL_PATTERNS,
  INTERVAL_TO_DEGREE,
  DEGREE_COLORS,
} from "../constants";
import {
  KeyData,
  NoteName,
  ActiveNote,
  DiatonicChord,
  PatternCategory,
} from "../types";

// --- HELPERS ---

const MODE_TO_RELATIVE_MAJOR_SEMITONES: Record<string, number> = {
  maj: 0,
  scale_maj: 0,
  ionian: 0,
  dorian: -2,
  phrygian: -4,
  lydian: 5,
  mixolydian: -7,
  min: -9,
  scale_min: -9,
  aeolian: -9,
  locrian: -11,
};

// Maps any chromatic index to a standard VexFlow Major Key signature
const INDEX_TO_STANDARD_MAJOR: Record<number, string> = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
};

export const getRelativeMajorTonic = (
  tonic: NoteName,
  patternId: string,
): string => {
  let modeKey = "maj";
  if (patternId.includes("min") || patternId.includes("aeolian"))
    modeKey = "min";
  else if (patternId.includes("dorian")) modeKey = "dorian";
  else if (patternId.includes("phrygian")) modeKey = "phrygian";
  else if (patternId.includes("lydian")) modeKey = "lydian";
  else if (patternId.includes("mixolydian")) modeKey = "mixolydian";
  else if (patternId.includes("locrian")) modeKey = "locrian";

  const shift = MODE_TO_RELATIVE_MAJOR_SEMITONES[modeKey] || 0;
  const tonicIndex = CHROMATIC_SCALE.indexOf(tonic);

  let relIndex = (tonicIndex + shift) % 12;
  if (relIndex < 0) relIndex += 12;

  // Use standard major signatures to avoid VexFlow crashes (e.g. G# -> Ab)
  return INDEX_TO_STANDARD_MAJOR[relIndex];
};

const shouldUseFlats = (tonic: NoteName, patternId: string): boolean => {
  const relMajor = getRelativeMajorTonic(tonic, patternId);
  // Major keys that use flats
  if (["F", "Bb", "Eb", "Ab", "Db", "Gb", "Cb"].includes(relMajor)) return true;
  return false;
};

const resolveNoteName = (
  absoluteSemitone: number,
  useFlats: boolean,
): string => {
  const index = absoluteSemitone % 12;
  return useFlats ? NOTES_FLAT[index] : NOTES_SHARP[index];
};

// --- EXPORTS ---

export const generatePianoKeys = (
  startOctave: number,
  endOctave: number,
): KeyData[] => {
  const keys: KeyData[] = [];

  for (let octave = startOctave; octave <= endOctave; octave++) {
    CHROMATIC_SCALE.forEach((note, index) => {
      const semitoneIndex = (octave + 1) * 12 + index;
      const midiNote = semitoneIndex;
      const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
      const toneNote = `${note}${octave}`;

      keys.push({
        note,
        octave,
        midiNote,
        toneNote,
        isBlack: note.includes("#"),
        frequency,
      });
    });
  }
  return keys;
};

const getChordQuality = (
  third: number,
  fifth: number,
): { label: string; suffix: string } => {
  if (third === 4 && fifth === 7) return { label: "Mayor", suffix: "Maj" };
  if (third === 3 && fifth === 7) return { label: "Menor", suffix: "min" };
  if (third === 3 && fifth === 6) return { label: "Disminuido", suffix: "dim" };
  if (third === 4 && fifth === 8) return { label: "Aumentado", suffix: "aug" };
  return { label: "?", suffix: "" };
};

const getRoman = (
  degreeIndex: number,
  quality: string,
  semitoneFromRoot: number,
): string => {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];

  const baseRoman = romans[degreeIndex];
  const expectedMajorInterval = majorIntervals[degreeIndex];

  let prefix = "";
  const diff = semitoneFromRoot - expectedMajorInterval;

  if (diff === -1) prefix = "b";
  if (diff === -2) prefix = "bb";
  if (diff === 1) prefix = "#";

  let finalRoman = prefix + baseRoman;

  if (quality === "min" || quality === "dim") {
    finalRoman =
      prefix + baseRoman.toLowerCase() + (quality === "dim" ? "°" : "");
  }

  return finalRoman;
};

export const calculateActiveNotes = (
  tonic: NoteName,
  patternId: string,
  inversion: number = 0,
): ActiveNote[] => {
  const pattern = MUSICAL_PATTERNS.find((p) => p.id === patternId);
  if (!pattern) return [];

  // FIX 5: Decouple inversion from Scale logic.
  // Always start scales from root (inversion 0) to avoid confusion.
  const isScale = pattern.category === PatternCategory.SCALE;
  const effectiveInversion = isScale ? 0 : inversion;

  const tonicIndex = CHROMATIC_SCALE.indexOf(tonic);

  // Use Octave 3 as base (instead of 4) so that scales and chords
  // fit within the C3-B4 piano display range.
  const BASE_OCTAVE = 3;

  const useFlats = shouldUseFlats(tonic, patternId);

  return pattern.intervals.map((originalInterval) => {
    let semitoneShift = originalInterval;

    // Determine note position in the chord structure (for inversions)
    const sortedIntervals = [...pattern.intervals].sort((a, b) => a - b);
    const indexInChord = sortedIntervals.indexOf(originalInterval);

    // FIX 4: Visual Inversions
    // Apply octave shift to inverted notes
    if (indexInChord < effectiveInversion) {
      semitoneShift += 12;
    }

    const absoluteSemitoneFromBaseC = tonicIndex + semitoneShift;

    // Calculate final octave based on semitone distance from C of current octave
    // This handles wrapping (e.g., B to C next octave)
    const relativeOctave = Math.floor(absoluteSemitoneFromBaseC / 12);
    const finalOctave = BASE_OCTAVE + relativeOctave;

    const noteName = resolveNoteName(
      absoluteSemitoneFromBaseC,
      useFlats,
    ) as NoteName;

    const normalizedInterval = originalInterval % 12;
    let degreeInfo = INTERVAL_TO_DEGREE[normalizedInterval];
    if (!degreeInfo) degreeInfo = { label: "?", colorKey: "x" };

    return {
      note: noteName,
      octave: finalOctave,
      interval: originalInterval,
      toneNote: `${CHROMATIC_SCALE[absoluteSemitoneFromBaseC % 12]}${finalOctave}`,
      degreeLabel: degreeInfo.label,
      color: DEGREE_COLORS[degreeInfo.colorKey],
    };
  });
};

export const calculateDiatonicChords = (
  scaleNotes: ActiveNote[],
): DiatonicChord[] => {
  if (scaleNotes.length < 7) return [];

  const sortedScale = [...scaleNotes].sort(
    (a, b) =>
      a.octave * 12 +
      CHROMATIC_SCALE.indexOf(a.note) -
      (b.octave * 12 + CHROMATIC_SCALE.indexOf(b.note)),
  );
  const diatonicChords: DiatonicChord[] = [];

  for (let i = 0; i < sortedScale.length; i++) {
    const rootNote = sortedScale[i];
    const thirdNote = sortedScale[(i + 2) % sortedScale.length];
    const fifthNote = sortedScale[(i + 4) % sortedScale.length];

    let distThird = (thirdNote.interval - rootNote.interval + 12) % 12;
    let distFifth = (fifthNote.interval - rootNote.interval + 12) % 12;

    const qualityInfo = getChordQuality(distThird, distFifth);
    const roman = getRoman(i, qualityInfo.suffix, rootNote.interval);

    const fixedPreviewNotes = [rootNote, thirdNote, fifthNote].map(
      (n) => n.toneNote,
    );

    diatonicChords.push({
      degree: roman,
      root: rootNote.note,
      quality: qualityInfo.suffix,
      fullName: `${rootNote.note} ${qualityInfo.suffix}`,
      color: rootNote.color,
      chordNotes: fixedPreviewNotes,
    });
  }

  return diatonicChords;
};
