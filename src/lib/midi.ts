import * as Tone from "tone";
import { ChordForUtils } from "@/lib/types";
import { fitRange } from "@/lib/utils";

const toneSettings = {
  urls: ["F#2", "A2", "C3", "D#3", "F#3", "A3", "C4", "D#4", "F#4", "A4", "C5", "D#5"].reduce((obj, k) => ({
    ...obj,
    [`${k}`]: `${k.replace("#", "s")}.mp3`,
  }), {}),
  baseUrl: "https://tonejs.github.io/audio/salamander/",
};

const notesNumToName = (notes: number[]) => {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  return notes.map((n) => `${names[n % 12]}${Math.floor(n / 12)}`);
};

const chordToNotes = (chord: ChordForUtils) => {
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
  return notesNumToName([bassNote, ...highNotes]);
};

export const getChordPlayer = async () => {
  const synth = new Tone.Sampler(toneSettings).toDestination();
  await Tone.loaded();
  return async (chord: ChordForUtils) => {
    const length = chord.beats * 60 / chord.bpm;
    const notes = chordToNotes(chord);
    synth.triggerAttackRelease(notes, length + 0.1);
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve("end");
      }, length * 1000);
    });
  };
};