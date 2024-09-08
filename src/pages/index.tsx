import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid2 as Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState, useEffect } from "react";
import ChordEditor from "./ChordEditor";

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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [filename, setFilename] = useState("chord");
  const [bpm, setBpm] = useState(160);
  const [key, setKey] = useState(0);
  const [beats, setBeats] = useState(2);

  const defaultChord: Chord = {
    bass: 1,
    shape: "135",
    beats: 2,
    key: 12,
  };

  const keyOptions = [
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

  const [chords, setChords] = useState<Chord[]>([defaultChord]);

  const onChangeChord = (chord: Chord, i: number) => {
    const newChords = [...chords];
    newChords[i] = chord;
    setChords(newChords);
  };

  const addChord = (i: number) => {
    const newChords = [...chords];
    if (i >= 0) {
      newChords.splice(i, 0, defaultChord);
    } else {
      newChords.push(defaultChord);
    }
    setChords(newChords);
  };

  const removeChord = (i: number) => {
    const newChords = [...chords];
    newChords.splice(i, 1);
    setChords(newChords);
  };

  const downloadJson = () => {
    const dlData = {
      default_beats: beats,
      bgcolor: "#ffffff",
      color: "#88ccee",
      chords: chords,
    };
    if (!dlData.chords[0].bpm) { dlData.chords[0].bpm = bpm; }
    if (!dlData.chords[0].key) { dlData.chords[0].key = key; }
    const element = document.createElement("a");
    element.style.display = "none";
    const file = new Blob([JSON.stringify(dlData)], { type: "application/json" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleChangeFile = async (e: React.FormEvent<HTMLInputElement>) => {
    setLoading(true);
    try {
      const fileReader = new window.FileReader();
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file && file.type == "application/json") {
        fileReader.onload = function (event) {
          const text = String(event.target?.result);
          const jsonData = JSON.parse(text);
          setFilename(file.name.split(".json")[0]);
          if (jsonData.default_beats) setBeats(jsonData.default_beats);
          if (jsonData.chords[0].bpm) setBpm(jsonData.chords[0].bpm);
          if (jsonData.chords[0].key) setKey(jsonData.chords[0].key);
          setChords(jsonData.chords);
        }
        fileReader.readAsText(file);
      } else {
        throw new Error("File is invalid");
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [chords]);

  return (
    <>
      <Grid container spacing={2} sx={{ m: 5 }}>
        <Grid size={12}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            #てぃみ式 コードエディタ
          </Typography>
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: 150 }}>
              <TextField
                id="filename"
                label="ファイル名 (.json)"
                size="small"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                fullWidth
              />
            </Box>
            <Box sx={{ width: 100 }}>
              <TextField
                id="bpm"
                label="初期BPM"
                size="small"
                value={bpm}
                type="number"
                onChange={(e) => setBpm(Number(e.target.value))}
                fullWidth
              />
            </Box>
            <Box sx={{ width: 100 }}>
              <TextField
                select
                id="key"
                label="初期キー"
                size="small"
                value={key}
                onChange={(e) => setKey(Number(e.target.value))}
                fullWidth
              >
                {keyOptions.map((k) => (
                  <MenuItem key={k.value} value={k.value}>
                    {k.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ width: 150 }}>
              <TextField
                id="beats"
                label="デフォルト拍数"
                size="small"
                value={beats}
                type="number"
                onChange={(e) => setBeats(Number(e.target.value))}
                fullWidth
              />
            </Box>

            <Button
              color="success"
              variant="contained"
              size="small"
              onClick={downloadJson}
              sx={{ mx: 1 }}
            >
              JSONダウンロード
            </Button>
            <input
              accept={".json"}
              value=""
              multiple
              type="file"
              style={{ display: "none" }}
              onInput={handleChangeFile}
              ref={inputRef}
            />
            <Button
              color="primary"
              variant="contained"
              size="large"
              sx={{ mx: 1 }}
              onClick={() => inputRef.current?.click()}
            >
              JSON読み込み
            </Button>
          </Box>
        </Grid>
        <Grid size={12}>
          {chords.map((chord, i) => (
            <ChordEditor
              key={i}
              chord={chord}
              defaultBeats={beats}
              onChange={(c: Chord) => onChangeChord(c, i)}
              addChord={() => addChord(i)}
              removeChord={() => removeChord(i)}
            />
          ))}
        </Grid>
        <Grid size={12}>
          <Button
            color="primary"
            variant="contained"
            size="small"
            onClick={() => addChord(-1)}
          >
            追加
          </Button>
        </Grid>
      </Grid>
      <Backdrop open={loading}>
        <CircularProgress color="success" />
      </Backdrop>
    </>
  );
};
