import * as Tone from "tone";

let sampler: Tone.Sampler | null = null;
let reverb: Tone.Reverb | null = null;
let isLoaded = false;

type NoteListener = (toneNote: string) => void;
const noteListeners = new Set<NoteListener>();

export const addNoteListener = (listener: NoteListener) => {
  noteListeners.add(listener);
  return () => {
    noteListeners.delete(listener);
  };
};

const notifyNote = (toneNote: string) => {
  noteListeners.forEach((fn) => fn(toneNote));
};

// Initialize Tone.js Context and Sampler
export const initAudio = async () => {
  if (sampler) {
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
    await Tone.loaded();
    return;
  }

  await Tone.start();

  reverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.1,
    wet: 0.3,
  }).toDestination();
  await reverb.generate();

  // Using Salamander Piano samples (Open Source)
  sampler = new Tone.Sampler({
    urls: {
      A0: "A0.mp3",
      C1: "C1.mp3",
      "D#1": "Ds1.mp3",
      "F#1": "Fs1.mp3",
      A1: "A1.mp3",
      C2: "C2.mp3",
      "D#2": "Ds2.mp3",
      "F#2": "Fs2.mp3",
      A2: "A2.mp3",
      C3: "C3.mp3",
      "D#3": "Ds3.mp3",
      "F#3": "Fs3.mp3",
      A3: "A3.mp3",
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
      C5: "C5.mp3",
      "D#5": "Ds5.mp3",
      "F#5": "Fs5.mp3",
      A5: "A5.mp3",
      C6: "C6.mp3",
      "D#6": "Ds6.mp3",
      "F#6": "Fs6.mp3",
      A6: "A6.mp3",
      C7: "C7.mp3",
      "D#7": "Ds7.mp3",
      "F#7": "Fs7.mp3",
      A7: "A7.mp3",
      C8: "C8.mp3",
    },
    release: 1,
    baseUrl: "https://tonejs.github.io/audio/salamander/",
    onload: () => {
      isLoaded = true;
      console.log("Piano samples loaded");
    },
  }).connect(reverb!);

  await Tone.loaded();
};

// Play a single note
export const playTone = async (note: string) => {
  await initAudio();
  if (sampler && isLoaded) {
    sampler.triggerAttackRelease(note, "2n");
  } else {
    // Fallback synth if samples aren't ready
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(note, "8n");
  }
  notifyNote(note);
};

// Strum a chord (notes played almost simultaneously)
export const playChord = async (notes: string[]) => {
  await initAudio();

  const now = Tone.now();
  if (sampler && isLoaded) {
    notes.forEach((note, index) => {
      // Slight strum effect (30ms delay between notes)
      sampler.triggerAttackRelease(note, "2n", now + index * 0.03);
      setTimeout(
        () => notifyNote(note),
        Math.max(0, (now + index * 0.03 - Tone.now()) * 1000),
      );
    });
  } else {
    // Fallback synth if samples aren't ready
    const polySynth = new Tone.PolySynth().toDestination();
    notes.forEach((note, index) => {
      polySynth.triggerAttackRelease(note, "2n", now + index * 0.03);
      setTimeout(
        () => notifyNote(note),
        Math.max(0, (now + index * 0.03 - Tone.now()) * 1000),
      );
    });
  }
};

// Arpeggiate a scale (up and down)
export const playScale = async (notes: string[]) => {
  await initAudio();

  const now = Tone.now();
  const duration = 0.25; // 16th notes roughly

  let fallbackSynth: Tone.PolySynth | null = null;
  const playNote = (note: string, time: number) => {
    if (sampler && isLoaded) {
      sampler.triggerAttackRelease(note, "4n", time);
    } else {
      if (!fallbackSynth) {
        fallbackSynth = new Tone.PolySynth().toDestination();
      }
      fallbackSynth.triggerAttackRelease(note, "4n", time);
    }
  };

  // Up
  notes.forEach((note, index) => {
    playNote(note, now + index * duration);
    setTimeout(
      () => notifyNote(note),
      Math.max(0, (now + index * duration - Tone.now()) * 1000),
    );
  });

  // Down (exclude top note to avoid repetition)
  const reversed = [...notes].reverse().slice(1);
  const offset = notes.length * duration;

  reversed.forEach((note, index) => {
    playNote(note, now + offset + index * duration);
    setTimeout(
      () => notifyNote(note),
      Math.max(0, (now + offset + index * duration - Tone.now()) * 1000),
    );
  });
};
