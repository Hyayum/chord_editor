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
import ChordEditor from "./ChordEditor";
import NumberField from "@/components/NumberField";
import ChordPreviewButton from "@/components/ChordPreviewButton";
import { getChordPlayer, createMidi } from "@/lib/midi";
import { getChordsForUtils } from "@/lib/utils";
import { Chord, defaultChord, keyOptions } from "@/lib/types";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [filename, setFilename] = useState("chord");
  const [bpm, setBpm] = useState(160);
  const [key, setKey] = useState(0);
  const [beats, setBeats] = useState(2);
  const [chords, setChords] = useState<Chord[]>([defaultChord]);
  const [nowPlaying, setNowPlaying] = useState(0);

  const chordsRef = useRef<Chord[]>([]);
  useEffect(() => {
    chordsRef.current = chords;
  }, [chords]);

  const chordsForUtils = getChordsForUtils(chords, key, bpm, beats);

  const onChangeChord = (chord: Chord, i: number) => {
    const newChords = [...chordsRef.current];
    newChords[i] = chord;
    setChords(newChords);
  };

  const addChord = (i: number) => {
    const newChords = [...chordsRef.current];
    if (i >= 0) {
      newChords.splice(i, 0, { ...defaultChord, beats: beats });
    } else {
      newChords.push({ ...defaultChord, beats: beats });
    }
    setChords(newChords);
  };

  const removeChord = (i: number) => {
    const newChords = [...chordsRef.current];
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
    if ((dlData.chords[0].key ?? 12) == 12) { dlData.chords[0].key = key; }
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

  const downloadMidi = () => {
    const data = createMidi(chordsForUtils);
    const element = document.createElement("a");
    element.style.display = "none";
    const file = new Blob([data], { type: "audio/midi" });
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.mid`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const preview = async (i: number) => {
    setNowPlaying(i);
    setLoading(true);
    const playChord = await getChordPlayer();
    setLoading(false);
    await playChord(chordsForUtils[i]);
  };

  const links = [
    { "url": "https://note.com/timireno/n/nd6f8b4b2fc65", label: "⓪概要" },
    { "url": "https://note.com/timireno/n/n6809f646a92d", label: "①コードの機能と進行と転調" },
    { "url": "https://note.com/timireno/n/n3e91d7162dcb", label: "②変位と調と音程" },
    { "url": "https://note.com/timireno/n/n53a2faf1ca37", label: "③和音の構成と主機能" },
  ];

  return (
    <>
      <Grid container spacing={3} sx={{ m: 5, minWidth: 1500 }}>
        <Grid size={12}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            #てぃみ式 コードエディタ
          </Typography>
          <Typography variant="subtitle2">
            理論について：
          </Typography>
          <Box sx={{ ml: 1 }}>
            {links.map((link) => (
              <Typography variant="subtitle2" key={link.label}>
                <Link href={link.url} style={{ color: "green", marginLeft: 1, textDecoration: "underline" }}>
                  {link.label}
                </Link>
              </Typography>
            ))}
          </Box>
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
                slotProps={{
                  select: { 
                    MenuProps: { disableScrollLock: true },
                  },
                }}
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
            <Button
              color="warning"
              variant="contained"
              size="small"
              onClick={downloadMidi}
              sx={{ mx: 1 }}
            >
              MIDI作成
            </Button>
          </Box>
        </Grid>
        <Grid size={12}>
          <ChordPreviewButton
            chords={chordsForUtils}
            setIndex={setNowPlaying}
            setLoading={setLoading}
          />
        </Grid>
        <Grid size={12}>
          {chords.map((chord, i) => (
            <Box sx={{ display: "flex" }} key={i}>
              <IconButton
                color={i == nowPlaying ? "warning" : "primary"}
                size="small"
                onClick={() => preview(i)}
                sx={{ mr: 1 }}
              >
                <PlayArrow />
              </IconButton>
              <ChordEditor
                index={i + 1}
                chord={chord}
                keySf={chordsForUtils[i].key}
                prevChord={i > 0 ? chordsForUtils[i - 1] : null}
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
        <CircularProgress sx={{ color: "white" }} />
      </Backdrop>
    </>
  );
};
