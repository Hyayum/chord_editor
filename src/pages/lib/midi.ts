import { Chord } from "@/index";

interface ChordForMidi {
  memo?: string;
  bpm: number;
  key: number;
  bass: number;
  shape: string;
  accd?: number[];
  beats: number;
};

const fitRange = (n: number, min: number, width: number) => {
  return ((n - min) % width + width) % width + min;
};

export const getChordsForMidi = (chords: Chord[], key: number, bpm: number, beats: number): ChordForMidi[] => {
  const chordsForMidi = [];
  let currentKey = key;
  let currentBpm = bpm;
  for (let chord of chords) {
    currentKey = (chord.key && chord.key != 12) ? chord.key : currentKey;
    currentBpm = chord.bpm ? chord.bpm : currentBpm;
    chordsForMidi.push({
      ...chord,
      key: currentKey,
      bpm: currentBpm,
      beats: chord.beats || beats,
    });
  }
  return chordsForMidi;
};

const chordToNotes = (chord: ChordForMidi) => {
  const baseScale = [0, 2, 4, 5, 7, 9, 11];
  const scale = baseScale.map((n, i) => 
    chord.accd?.includes(i + 1) ? n + 1 : 
    chord.accd?.includes(-i - 1) ? n - 1 : n
  );
  const keyUd = fitRange(chord.key * 7, 0, 12);
  const bassNote12 = keyUd + scale[chord.bass - 1];
  const bassNote = fitRange(bassNote12, 29, 12); // bass 29(F1) ~ 40(E2)
  const highNotes = Array.from(chord.shape).map((n) => {
    const scaleIndex = fitRange(chord.bass + Number(n) - 2, 0, 7);
    const note12 = keyUd + scale[scaleIndex];
    return fitRange(note12, 53, 12); // high 53(F3) ~ 64(E4)
  });
  return [bassNote, ...highNotes];
};

export const getChordPlayer = async () => {
  const midi = await window.navigator.requestMIDIAccess();
  const output = Array.from(midi.outputs)[0][1];
  return async (chord: ChordForMidi) => {
    const length = chord.beats * 60 / chord.bpm;
    const notes = chordToNotes(chord);
    for (let note of notes) {
      output.send([0x90, note, 127]);
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        for (let note of notes) {
          output.send([0x80, note, 127]);
        }
        resolve("end");
      }, length * 1000);
    });
  };
};

export const stopMidi = () => {
  window.navigator.requestMIDIAccess().then((midi) => {
    const output = Array.from(midi.outputs)[0][1];
    for (let i = 0; i < 128; i++) {
      output.send([0x80, i, 127]);
    }
  });
};