export interface Chord {
    memo?: string;
    bpm?: number;
    key?: number;
    bass: number;
    shape: string;
    accd?: number[];
    beats: number;
  };
  
  export const keyOptions = [
    { label: "C", value: 0 },
    { label: "D♭", value: -5 },
    { label: "D", value: 2 },
    { label: "E♭", value: -3 },
    { label: "E", value: 4 },
    { label: "F", value: -1 },
    { label: "G♭", value: -6 },
    { label: "G", value: 1 },
    { label: "A♭", value: -4 },
    { label: "A", value: 3 },
    { label: "B♭", value: -2 },
    { label: "B", value: 5 },
  ];
  
  export const defaultChord: Chord = {
    bass: 1,
    shape: "135",
    beats: 2,
    key: 12,
  };