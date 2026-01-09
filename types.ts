export type NoteName =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export enum PatternCategory {
  CHORD = "Acorde",
  SCALE = "Escala",
}

export interface MusicalPattern {
  id: string;
  name: string;
  category: PatternCategory;
  intervals: number[]; // Semitones from root
}

export interface KeyData {
  note: NoteName;
  octave: number;
  midiNote: number;
  toneNote: string; // e.g., "C4", "F#3" for Tone.js
  isBlack: boolean;
  frequency: number;
}

export interface ActiveNote {
  note: NoteName;
  octave: number;
  interval: number;
  toneNote: string;
  degreeLabel: string; // e.g., "I", "bIII", "V"
  color: string; // Hex code or Tailwind class for the specific degree
}

export interface DiatonicChord {
  degree: string; // e.g., "I", "ii", "vii°"
  root: NoteName; // e.g., "C"
  quality: string; // e.g., "Maj", "min", "dim"
  fullName: string; // e.g., "C Maj"
  color: string; // Color based on the root's degree in the scale
  chordNotes: string[]; // List of toneNotes (e.g. ["C4", "E4", "G4"]) to play/highlight
}
