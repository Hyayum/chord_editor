import { Chord, ChordForUtils } from "@/lib/types";

export const accdNumToSf = (n: number) => {
  if (n > 0) return `${n}＃`;
  else if (n < 0) return `${-n}♭`;
  else return `${n}`;
};

export const fitRange = (n: number, min: number, width: number) => {
  return ((n - min) % width + width) % width + min;
};

export const getChordsForUtils = (chords: Chord[], key: number, bpm: number, beats: number): ChordForUtils[] => {
  const chordsForMidi = [];
  let currentKey = key;
  let currentBpm = bpm;
  for (const chord of chords) {
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

export const calcMainFunc = (bass: number, shape: string) => {
  const arr = Array.from(shape).map((n) => Number(n));
  const points = arr.map((n) => {
    let p = 0;
    if (n == 1) { p += 2; }
    if (arr.includes((n + 1) % 7 + 1)) { p += 2; }
    if (arr.includes((n + 3) % 7 + 1)) { p += 3; }
    if (arr.includes((n + 5) % 7 + 1)) { p += 1; }
    return { num: n, point: p };
  });
  const maxPoint = points.reduce((max, val) => Math.max(val.point, max), 0);
  const firstMainFunc = points.filter((p) => p.point == maxPoint).map((p) => (p.num + bass - 2) % 7 + 1).join(",");
  const secondMainFunc = points.filter((p) => p.point == maxPoint - 1).map((p) => (p.num + bass - 2) % 7 + 1).join(",");
return `${firstMainFunc}${secondMainFunc && "/"}${secondMainFunc}`;
};

export const calcScaleLevel = (accd: number[] = []) => {
  const marks = ["α", "β", "γ", "δ", "ε", "ζ", "η"];
  const baseCircle = [1, 3, 5, 0, 2, 4, 6];
  const circle = baseCircle.map((n, i) => 
    accd.includes(i + 1) ? n + 7 :
    accd.includes(-i - 1) ? n - 7 : n
  );
  const range = Math.max(...circle) - Math.min(...circle);
  if (range == 6) { return "-"; }
  return `${marks[range % 7]}${Math.floor((range - 7) / 7) > 0 ? Math.floor((range - 7) / 7) + 1 : ""}`;
};

export const calcRealname = (key: number, bass: number, shape: string, accd: number[] = []) => {
  const baseCircle = ["F", "C", "G", "D", "A", "E", "B"];
  const locations = [1, 3, 5, 0, 2, 4, 6].map((n, i) => n + key + (
    accd.includes(i + 1) ? 7 :
    accd.includes(-i - 1) ? -7 : 0
  ));
  const notes = Array.from(shape).map((n) => Number(n) + bass - 1).map((n) => {
    const location = locations[(n - 1) % 7];
    const name = baseCircle[fitRange(location, 0, 7)];
    const sf = location > 0 ? Array(Math.floor(location / 7)).fill("#").join("").replace(/##/g, "×") : 
      location < 0 ? Array(-Math.floor(location / 7)).fill("b").join("") : "";
    return `${name}${sf}`;
  });
  return notes.join(", ");
};