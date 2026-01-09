import React, { useCallback, useEffect, useMemo, useState } from "react";
import PianoKey from "./PianoKey";
import { ActiveNote, KeyData, NoteName } from "../types";
import { addNoteListener, playTone } from "../utils/audio";
import { generatePianoKeys } from "../utils/musicTheory";

interface PianoProps {
  tonic: NoteName;
  activeNotes: ActiveNote[];
}

const Piano: React.FC<PianoProps> = ({ tonic, activeNotes }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const pressKey = useCallback((toneNote: string) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.add(toneNote);
      return next;
    });
  }, []);

  const releaseKey = useCallback((toneNote: string) => {
    setPressedKeys((prev) => {
      if (!prev.has(toneNote)) return prev;
      const next = new Set(prev);
      next.delete(toneNote);
      return next;
    });
  }, []);

  // Highlight notes when audio playback occurs (preview or programmatic play)
  useEffect(() => {
    const HOLD_MS = 650;
    const unsubscribe = addNoteListener((toneNote) => {
      pressKey(toneNote);
      setTimeout(() => releaseKey(toneNote), HOLD_MS);
    });
    return unsubscribe;
  }, [pressKey, releaseKey]);

  // Keyboard mapping: A-S-D-F-G-H-J for white keys, W-E-T-Y-U for black keys
  const keyboardMap: { [key: string]: string } = {
    a: "C3",
    s: "D3",
    d: "E3",
    f: "F3",
    g: "G3",
    h: "A3",
    j: "B3",
    w: "C#3",
    e: "D#3",
    t: "F#3",
    y: "G#3",
    u: "A#3",
  };

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      const key = ev.key.toLowerCase();
      const toneNote = keyboardMap[key];

      if (!toneNote) return;

      ev.preventDefault();
      pressKey(toneNote);
      playTone(toneNote);
    };

    const handleKeyUp = (ev: KeyboardEvent) => {
      const key = ev.key.toLowerCase();
      const toneNote = keyboardMap[key];

      if (!toneNote) return;

      releaseKey(toneNote);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressKey, releaseKey, keyboardMap]);

  // Updated Range: C3 to C5 (2 full octaves + 1 note) to show bass clef notes properly
  const keys = useMemo(() => generatePianoKeys(3, 4), []);
  // Note: generatePianoKeys(3, 4) generates C3...B4. That's good enough for Bass/Treble split around C4.

  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  const getActiveData = useCallback(
    (keyNote: NoteName, keyOctave: number) => {
      return activeNotes.find((an) => {
        if (an.octave !== keyOctave) return false;

        // Exact match
        if (an.note === keyNote) return true;

        // Enharmonic match
        const sharps = [
          "C",
          "C#",
          "D",
          "D#",
          "E",
          "F",
          "F#",
          "G",
          "G#",
          "A",
          "A#",
          "B",
        ];
        const flats = [
          "C",
          "Db",
          "D",
          "Eb",
          "E",
          "F",
          "Gb",
          "G",
          "Ab",
          "A",
          "Bb",
          "B",
        ];

        const sharpIndex = sharps.indexOf(keyNote);
        if (sharpIndex === -1) return false;

        if (an.note === flats[sharpIndex]) return true;

        return false;
      });
    },
    [activeNotes],
  );

  const handlePress = useCallback(
    (toneNote: string) => {
      pressKey(toneNote);
      playTone(toneNote);
    },
    [pressKey],
  );

  const handleRelease = useCallback(
    (toneNote: string) => {
      releaseKey(toneNote);
    },
    [releaseKey],
  );

  const getBlackKeyPosition = useCallback((key: KeyData) => {
    const octaveOffset = (key.octave - 3) * 7;
    let noteOffset = 0;
    if (key.note === "C#") noteOffset = 0;
    if (key.note === "D#") noteOffset = 1;
    if (key.note === "F#") noteOffset = 3;
    if (key.note === "G#") noteOffset = 4;
    if (key.note === "A#") noteOffset = 5;

    const whiteKeyIndex = octaveOffset + noteOffset;
    const leftPercent = ((whiteKeyIndex + 1) / 14) * 100;
    const widthPercent = 4.8;

    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      transform: "translateX(-50%)",
    };
  }, []);

  return (
    <div className="w-full relative select-none p-2">
      {/* Container for keys */}
      <div className="relative flex justify-between h-48 sm:h-64 rounded-b-[24px] overflow-hidden bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 p-1">
        {/* White Keys */}
        {whiteKeys.map((key) => {
          const activeData = getActiveData(key.note, key.octave);
          const isPressed = pressedKeys.has(key.toneNote);

          return (
            <PianoKey
              key={`${key.note}-${key.octave}`}
              keyData={key}
              activeData={activeData}
              isPressed={isPressed}
              onPress={() => handlePress(key.toneNote)}
              onRelease={() => handleRelease(key.toneNote)}
            />
          );
        })}

        {/* Black Keys */}
        {blackKeys.map((key) => {
          const activeData = getActiveData(key.note, key.octave);
          const isPressed = pressedKeys.has(key.toneNote);
          const positionStyle = getBlackKeyPosition(key);

          return (
            <PianoKey
              key={`${key.note}-${key.octave}`}
              keyData={key}
              activeData={activeData}
              isPressed={isPressed}
              positionStyle={positionStyle}
              onPress={() => handlePress(key.toneNote)}
              onRelease={() => handleRelease(key.toneNote)}
            />
          );
        })}
      </div>

      <div className="absolute top-1 left-2 right-2 h-1 bg-[#2D3436] rounded-full opacity-10 pointer-events-none"></div>
    </div>
  );
};

export default Piano;
