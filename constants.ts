import { MusicalPattern, NoteName, PatternCategory } from "./types";

export const NOTES_SHARP: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
];

export const NOTES_FLAT: string[] = [
  "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
];

// Alias for generic usage, defaults to sharps for indexing
export const CHROMATIC_SCALE = NOTES_SHARP;

// "Modern Harmony" Palette (Tailwind 500s)
export const DEGREE_COLORS = {
  I:   "#3B82F6", // Blue 500
  II:  "#06B6D4", // Cyan 500
  III: "#10B981", // Emerald 500
  IV:  "#F59E0B", // Amber 500
  V:   "#F97316", // Orange 500
  VI:  "#EC4899", // Pink 500
  VII: "#8B5CF6", // Violet 500
  x:   "#E5E7EB"  // Gray 200
};

export const INTERVAL_TO_DEGREE: Record<number, { label: string; colorKey: keyof typeof DEGREE_COLORS }> = {
  0:  { label: "I", colorKey: "I" },
  1:  { label: "bII", colorKey: "II" },
  2:  { label: "II", colorKey: "II" },
  3:  { label: "bIII", colorKey: "III" },
  4:  { label: "III", colorKey: "III" },
  5:  { label: "IV", colorKey: "IV" },
  6:  { label: "#IV", colorKey: "IV" }, // Tritone
  7:  { label: "V", colorKey: "V" },
  8:  { label: "bVI", colorKey: "VI" },
  9:  { label: "VI", colorKey: "VI" },
  10: { label: "bVII", colorKey: "VII" },
  11: { label: "VII", colorKey: "VII" }
};

export const MUSICAL_PATTERNS: MusicalPattern[] = [
  // --- Acordes ---
  { id: "maj", name: "Mayor", category: PatternCategory.CHORD, intervals: [0, 4, 7] },
  { id: "min", name: "Menor", category: PatternCategory.CHORD, intervals: [0, 3, 7] },
  { id: "dim", name: "Disminuido", category: PatternCategory.CHORD, intervals: [0, 3, 6] },
  { id: "aug", name: "Aumentado", category: PatternCategory.CHORD, intervals: [0, 4, 8] },
  { id: "7", name: "Dominante 7", category: PatternCategory.CHORD, intervals: [0, 4, 7, 10] },
  { id: "maj7", name: "Mayor 7", category: PatternCategory.CHORD, intervals: [0, 4, 7, 11] },
  { id: "min7", name: "Menor 7", category: PatternCategory.CHORD, intervals: [0, 3, 7, 10] },

  // --- Escalas Básicas y Menores ---
  { id: "scale_maj", name: "Escala Mayor", category: PatternCategory.SCALE, intervals: [0, 2, 4, 5, 7, 9, 11] },
  { id: "scale_min", name: "Menor Natural", category: PatternCategory.SCALE, intervals: [0, 2, 3, 5, 7, 8, 10] },
  { id: "scale_min_harm", name: "Menor Armónica", category: PatternCategory.SCALE, intervals: [0, 2, 3, 5, 7, 8, 11] },
  { id: "scale_min_mel", name: "Menor Melódica", category: PatternCategory.SCALE, intervals: [0, 2, 3, 5, 7, 9, 11] },

  // --- Pentatónicas y Blues ---
  { id: "scale_pent_maj", name: "Pentatónica Mayor", category: PatternCategory.SCALE, intervals: [0, 2, 4, 7, 9] },
  { id: "scale_pent_min", name: "Pentatónica Menor", category: PatternCategory.SCALE, intervals: [0, 3, 5, 7, 10] },
  { id: "scale_blues", name: "Escala de Blues", category: PatternCategory.SCALE, intervals: [0, 3, 5, 6, 7, 10] },

  // --- Modos Griegos ---
  { id: "mode_dorian", name: "Dórico", category: PatternCategory.SCALE, intervals: [0, 2, 3, 5, 7, 9, 10] },
  { id: "mode_phrygian", name: "Frigio", category: PatternCategory.SCALE, intervals: [0, 1, 3, 5, 7, 8, 10] },
  { id: "mode_lydian", name: "Lidio", category: PatternCategory.SCALE, intervals: [0, 2, 4, 6, 7, 9, 11] },
  { id: "mode_mixolydian", name: "Mixolidio", category: PatternCategory.SCALE, intervals: [0, 2, 4, 5, 7, 9, 10] },
  { id: "mode_locrian", name: "Locrio", category: PatternCategory.SCALE, intervals: [0, 1, 3, 5, 6, 8, 10] },

  // --- Otras ---
  { id: "scale_whole", name: "Tonos Enteros", category: PatternCategory.SCALE, intervals: [0, 2, 4, 6, 8, 10] }
];