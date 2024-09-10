import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { PlayArrow } from "@mui/icons-material";
import { useRef, useState, useEffect } from "react";
import ChordEditor from "@/ChordEditor";
import NumberField from "@/components/NumberField";
import ChordPreviewButton from "@/components/ChordPreviewButton";
import { getChordPlayer, getChordsForMidi } from "@/lib/midi";

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

export default function Home() {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [filename, setFilename] = useState("chord");
  const [bpm, setBpm] = useState(160);
  const [key, setKey] = useState(0);
  const [beats, setBeats] = useState(2);
  const [chords, setChords] = useState<Chord[]>([defaultChord]);
  // const [nowPlaying, setNowPlaying] = useState(0);

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

  const onChangeChord = (chord: Chord, i: number) => {
    const newChords = [...chords];
    newChords[i] = chord;
    setChords(newChords);
  };

  const addChord = (i: number) => {
    const newChords = [...chords];
    if (i >= 0) {
      newChords.splice(i, 0, { ...defaultChord, beats: beats });
    } else {
      newChords.push({ ...defaultChord, beats: beats });
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
    const file = new Blob([JSON.stringify(dlData, undefined, 2)], { type: "application/json" });
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
          if (jsonData.chords?.[0]?.bpm) setBpm(jsonData.chords[0].bpm);
          if (jsonData.chords?.[0]?.key) setKey(jsonData.chords[0].key);
          setChords(jsonData.chords || []);
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

  const preview = async (i: number) => {
    //setNowPlaying(i);
    const playChord = await getChordPlayer();
    const chordsForMidi = getChordsForMidi(chords, key, bpm, beats);
    await playChord(chordsForMidi[i]);
  };

  return (
    <>
      <Grid container spacing={2} sx={{ m: 5, minWidth: 1200 }}>
        <Grid size={12}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            #てぃみ式 コードエディタ
          </Typography>
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: 100 }}>
              <NumberField
                id="bpm"
                label="初期BPM"
                size="small"
                value={bpm}
                onChange={(e) => setBpm(Math.max(Number(e.target.value), 0))}
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
              <NumberField
                id="beats"
                label="デフォルト拍数"
                size="small"
                value={beats}
                onChange={(e) => setBeats(Math.max(Number(e.target.value), 0))}
                fullWidth
              />
            </Box>

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
          <ChordPreviewButton
            chords={chords}
            keySf={key}
            bpm={bpm}
            beats={beats}
          />
        </Grid>
        <Grid size={12}>
          {chords.map((chord, i) => (
            <Box sx={{ display: "flex" }} key={i}>
              <IconButton
                // color={i == nowPlaying ? "warning" : "primary"} <- 重くなる
                color="primary"
                size="small"
                onClick={() => preview(i)}
                sx={{ mr: 1 }}
              >
                <PlayArrow />
              </IconButton>
              <ChordEditor
                index={i + 1}
                chord={chord}
                defaultBeats={beats}
                onChange={(c: Chord) => onChangeChord(c, i)}
                addChord={() => addChord(i)}
                removeChord={() => removeChord(i)}
              />
            </Box>
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
