import { Box, Button } from "@mui/material";
import { Stop, PlayArrow } from "@mui/icons-material";
import { useEffect, useState, useRef } from "react";
import { Chord } from "@/lib/types";
import { getChordPlayer, getChordsForMidi, stopMidi } from "@/lib/midi";
import NumberField from "@/components/NumberField";

interface Props {
  chords: Chord[];
  keySf: number;
  bpm: number;
  beats: number;
  setIndex: (i: number) => void;
};

export default function ChordPreviewButton(props: Props) {
  const { chords, keySf: key, bpm, beats, setIndex } = props;
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(playing);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  const [startFrom, setStartFrom] = useState(1);

  const previewAll = async () => {
    const chordsForMidi = getChordsForMidi(chords, key, bpm, beats);
    setPlaying(true);
    const playChord = await getChordPlayer();
    for (let i = Math.max(startFrom - 1, 0); i < chordsForMidi.length; i++) {
      setIndex(i);
      await playChord(chordsForMidi[i]);
      if (!playingRef.current) break;
    }
    setPlaying(false);
  };

  const stopPlayer = () => {
    setPlaying(false);
    stopMidi();
  };

  return (
    <Box sx={{ mr: 2, display: "flex" }}>
      {!playing && (
        <Button
          color="warning"
          variant="contained"
          size="small"
          startIcon={<PlayArrow />}
          onClick={previewAll}
          sx={{ mr: 1, width: 120 }}
        >
          全て再生
        </Button>
      )}
      {playing && (
        <Button
          color="warning"
          variant="contained"
          size="small"
          startIcon={<Stop />}
          onClick={stopPlayer}
          sx={{ mr: 1, width: 120 }}
        >
          停止
        </Button>
      )}
      <Box sx={{ width: 100 }}>
        <NumberField
          id="startFrom"
          label="開始位置"
          size="small"
          value={startFrom}
          onChange={(e) => setStartFrom(Math.max(Number(e.target.value), 0))}
          fullWidth
        />
      </Box>
    </Box>
  );
};