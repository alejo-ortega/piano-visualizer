import React, { useEffect, useRef } from "react";
import { ActiveNote, NoteName, PatternCategory } from "../types";
import { getRelativeMajorTonic } from "../utils/musicTheory";

// Declare VexFlow global
declare const Vex: any;

interface SheetMusicProps {
  activeNotes: ActiveNote[];
  mode: PatternCategory;
  tonic: NoteName;
  patternId: string;
}

const SheetMusic: React.FC<SheetMusicProps> = ({
  activeNotes,
  mode,
  tonic,
  patternId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    // Cleanup previous render
    containerRef.current.innerHTML = "";

    // FIX 1: Guard clause for empty data to prevent crash
    if (!activeNotes || activeNotes.length === 0) return;

    const VF = Vex.Flow;
    const width = wrapperRef.current.clientWidth || 600;
    const height = 250;

    const renderer = new VF.Renderer(
      containerRef.current,
      VF.Renderer.Backends.SVG,
    );
    renderer.resize(width, height);
    const context = renderer.getContext();
    context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    // Fixed margins so content stays aligned and not visually shifted
    const usableWidth = Math.min(width - 80, 820);
    const startX = 40;

    const trebleStave = new VF.Stave(startX, 10, usableWidth);
    const bassStave = new VF.Stave(startX, 100, usableWidth);

    // FIX 3: Key Signature Logic
    const relativeMajor = getRelativeMajorTonic(tonic, patternId);

    // Draw Staves with Key Signature
    trebleStave.addClef("treble").addKeySignature(relativeMajor);
    trebleStave.setContext(context).draw();

    bassStave.addClef("bass").addKeySignature(relativeMajor);
    bassStave.setContext(context).draw();

    // Connectors
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(VF.StaveConnector.type.BRACE)
      .setContext(context)
      .draw();
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(VF.StaveConnector.type.SINGLE_LEFT)
      .setContext(context)
      .draw();
    new VF.StaveConnector(trebleStave, bassStave)
      .setType(VF.StaveConnector.type.SINGLE_RIGHT)
      .setContext(context)
      .draw();

    // Sorting notes by pitch is critical for VexFlow to stack chords correctly without crossing
    const getPitchValue = (n: ActiveNote) => {
      const sharps = "C C# D D# E F F# G G# A A# B".split(" ");
      const flats = "C Db D Eb E F Gb G Ab A Bb B".split(" ");
      let index = sharps.indexOf(n.note);
      if (index === -1) index = flats.indexOf(n.note);
      return n.octave * 12 + (index === -1 ? 0 : index);
    };

    const sortedNotes = [...activeNotes].sort(
      (a, b) => getPitchValue(a) - getPitchValue(b),
    );

    const trebleNotes: any[] = [];
    const bassNotes: any[] = [];

    // Use KeyManager with STRICT LOWERCASE keys
    const keyManagerTreble = new VF.KeyManager(relativeMajor);
    const keyManagerBass = new VF.KeyManager(relativeMajor);

    if (mode === PatternCategory.SCALE) {
      const rootNote = sortedNotes[0];
      const baseRootOctave = rootNote.octave;

      // Remove duplicated octave tonic at the end (e.g., G4 ... G5)
      const scaleNotes = [...sortedNotes];
      const firstPitch = getPitchValue(rootNote);
      const lastPitch = getPitchValue(scaleNotes[scaleNotes.length - 1]);
      if (scaleNotes.length > 1 && lastPitch - firstPitch === 12) {
        scaleNotes.pop();
      }

      scaleNotes.forEach((n) => {
        // SCALE LOGIC: Sequential Notes
        const noteLower = n.note.toLowerCase();

        // Treble Note
        const tNoteStruct = keyManagerTreble.selectNote(noteLower);
        const tKey = `${tNoteStruct.note}/${n.octave}`;

        const tNote = new VF.StaveNote({
          clef: "treble",
          keys: [tKey],
          duration: "q",
          stem_direction: 1,
        });

        // Do not add extra accidentals; rely on key signature only
        trebleNotes.push(tNote);

        // Bass Note (Mirrored 1 octave down)
        const bNoteStruct = keyManagerBass.selectNote(noteLower);
        const bKey = `${bNoteStruct.note}/${n.octave - 1}`;

        const bNote = new VF.StaveNote({
          clef: "bass",
          keys: [bKey],
          duration: "q",
          stem_direction: -1,
        });

        // Do not add extra accidentals on bass either
        bassNotes.push(bNote);
      });
    } else {
      // CHORD LOGIC: Block Chords

      const tKeys: string[] = [];
      const bKeys: string[] = [];

      // Reset managers specifically for the chord block logic
      const kmT = new VF.KeyManager(relativeMajor);
      const kmB = new VF.KeyManager(relativeMajor);

      sortedNotes.forEach((n, i) => {
        const noteLower = n.note.toLowerCase();

        // Treble Staff
        const tRes = kmT.selectNote(noteLower);
        tKeys.push(`${tRes.note}/${n.octave}`);

        // Bass Staff: Mirror the chord 1 octave lower
        const bRes = kmB.selectNote(noteLower);
        bKeys.push(`${bRes.note}/${n.octave - 1}`);
      });

      if (tKeys.length > 0) {
        const tChord = new VF.StaveNote({
          clef: "treble",
          keys: tKeys,
          duration: "w",
          stem_direction: 1,
        });
        trebleNotes.push(tChord);
      }

      if (bKeys.length > 0) {
        const bChord = new VF.StaveNote({
          clef: "bass",
          keys: bKeys,
          duration: "w",
          stem_direction: -1,
        });
        bassNotes.push(bChord);
      }
    }

    const numBeats = Math.max(trebleNotes.length, bassNotes.length, 4);
    const trebleVoice = new VF.Voice({ num_beats: numBeats, beat_value: 4 })
      .setStrict(false)
      .addTickables(trebleNotes);
    const bassVoice = new VF.Voice({ num_beats: numBeats, beat_value: 4 })
      .setStrict(false)
      .addTickables(bassNotes);

    // Use independent formatters per staff to keep alignment predictable
    const trebleFormatter = new VF.Formatter();
    trebleFormatter
      .joinVoices([trebleVoice])
      .format([trebleVoice], usableWidth - 20);

    const bassFormatter = new VF.Formatter();
    bassFormatter.joinVoices([bassVoice]).format([bassVoice], usableWidth - 20);
    trebleVoice.draw(context, trebleStave);
    bassVoice.draw(context, bassStave);
  }, [activeNotes, mode, tonic, patternId]);

  return (
    <div className="bg-white border rounded-3xl" ref={wrapperRef}>
      <div ref={containerRef}></div>
    </div>
  );
};

export default SheetMusic;
