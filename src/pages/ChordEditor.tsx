import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { Chord, keyOptions, defaultChord } from "@/index"
import NumberField from "@/components/NumberField";

interface Props {
  index: number;
  chord: Chord;
  defaultBeats: number;
  onChange: (c: Chord) => void;
  addChord: () => void;
  removeChord: () => void;
};

export default function ChordEditor(props: Props) {
  const { index, chord = defaultChord, defaultBeats, onChange, addChord, removeChord } = props;

  const [openShape, setOpenShape] = useState(false);
  const shapeRef = useRef<HTMLInputElement>(null);
  const handleCloseShape = () => {
    setOpenShape(false);
  };
  const [openAccd, setOpenAccd] = useState(false);
  const accdRef = useRef<HTMLInputElement>(null);
  const handleCloseAccd = () => {
    setOpenAccd(false);
  };

  const numToAccd = (n: number) => {
    if (n > 0) return `${n}＃`;
    else if (n < 0) return `${-n}♭`;
    else return `${n}`;
  }; 

  return (
    <Paper elevation={2} sx={{ p: 1, pl: 0, my: 1 }}>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ width: 30 }}>
          <Typography variant="subtitle2" sx={{ color: "#aaa", textAlign: "center", mt: 1.1 }}>
            {index}
          </Typography>
        </Box>
        <Box sx={{ width: 100 }}>
          <TextField
            select
            id="bass"
            label="ベース"
            size="small"
            value={chord.bass}
            onChange={(e) => onChange({ ...chord, bass: Number(e.target.value) })}
            fullWidth
          >
            {Array(7).fill(0).map((z, b) => (
              <MenuItem key={b + 1} value={b + 1}>
                {b + 1}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ width: 100 }}>
          <TextField
            id="shape"
            label="和音"
            size="small"
            value={chord.shape}
            inputRef={shapeRef}
            onClick={() => setOpenShape(true)}
            inputProps={{ readOnly: true }}
            fullWidth
          />
        </Box>
        <ShapeSelector
          value={chord.shape}
          open={openShape}
          anchorEl={shapeRef.current}
          onChange={(s) => { onChange({ ...chord, shape: s }); handleCloseShape(); }}
          onClose={handleCloseShape}
        />

        <Box sx={{ width: 150 }}>
          <TextField
            id="accd"
            label="変位"
            size="small"
            value={chord.accd?.sort().map(numToAccd).join(", ") || ""}
            inputRef={accdRef}
            onClick={() => setOpenAccd(true)}
            inputProps={{ readOnly: true }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            fullWidth
          />
        </Box>
        <AccdSelector
          value={chord.accd}
          open={openAccd}
          anchorEl={accdRef.current}
          onChange={(a) => { onChange({ ...chord, accd: a }); }}
          onClose={handleCloseAccd}
        />

        <Box sx={{ width: 100 }}>
          <NumberField
            id="beats"
            label="拍数"
            size="small"
            value={chord.beats ?? defaultBeats}
            onChange={(e) => onChange({ ...chord, beats: Math.max(Number(e.target.value), 0) })}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>

        <Box sx={{ width: 150 }}>
          <TextField
            id="memo"
            label="メモ"
            size="small"
            value={chord.memo || ""}
            onChange={(e) => onChange({ ...chord, memo: e.target.value })}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>

        <Box sx={{ width: 100 }}>
          <TextField
            select
            id="key"
            label="キー変更"
            size="small"
            value={chord.key ?? 12}
            onChange={(e) => onChange({ ...chord, key: Number(e.target.value) })}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          >
            <MenuItem value={12}>
              -
            </MenuItem>
            {keyOptions.map((k) => (
              <MenuItem key={k.value} value={k.value}>
                {k.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ width: 180 }}>
          <NumberField
            id="bpm"
            label="BPM変更 (未設定: 0)"
            size="small"
            value={chord.bpm || 0}
            onChange={(e) => onChange({ ...chord, bpm: Math.max(Number(e.target.value), 0) })}
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />
        </Box>
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={addChord}
          sx={{ mx: 1 }}
        >
          上に追加
        </Button>
        <Button
          color="error"
          variant="contained"
          size="small"
          onClick={removeChord}
          sx={{ mx: 1 }}
        >
          削除
        </Button>
      </Box>
    </Paper>
  );
};


const ShapeSelector = ({
  value,
  open,
  anchorEl,
  onChange,
  onClose,
}: {
  value: string;
  open: boolean;
  anchorEl: HTMLInputElement | null;
  onChange: (s: string) => void;
  onClose: () => void;
}) => {
  
  const basicShapes = [
    ["135", "137", "157", "123", "125"],
    ["1357", "1235", "1345", "1457", "1567"],
    ["12357", "13457", "12345"],
    ["1", "13", "15", "17", "123457", "1234567"]
  ];
  const semiBasicShapes = ["156", "145", "13567", "123567", "134567"];
  const basicShapesWithSemi = basicShapes.reduce((arr, val) => arr.concat(val), []).concat(semiBasicShapes)

  const defaultTabValue = Math.abs(basicShapes.findIndex((shapes) => shapes.includes(value)));
  const [tabValue, setTabValue] = useState(defaultTabValue);

  const convertShape = (shape: string, b: number) => {
    const arr = Array.from(shape);
    return arr.map((n) => (Number(n) - (b - 1) + 6) % 7 + 1).sort().join("");
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={onClose}
    >
      <Paper elevation={3} sx={{ p: 1 }}>
        <Tabs value={tabValue} onChange={(e, n) => setTabValue(n)}>
          <Tab label="3和音" value={0} />
          <Tab label="4和音" value={1} />
          <Tab label="5和音" value={2} />
          <Tab label="その他" value={3} />
        </Tabs>
        <Box sx={{ m: 1 }}>
          {basicShapes[tabValue].map((basic) => (
            <Box sx={{ display: "flex" }} key={basic}>
              {Array(7).fill(0).map((z, n) => {
                const shape = convertShape(basic, n + 1);
                return (
                  <Box sx={{ width: 70 }} key={n}>
                    {basic.includes(String(n + 1)) && !(basic == "1234567" && n > 0) && (
                      <Button
                        color={
                          value == shape ? "error"
                          : basicShapesWithSemi.includes(shape) ? "success"
                          : "primary"
                        }
                        variant="contained"
                        size="small"
                        onClick={() => onChange(shape)}
                        sx={{ m: 0.2 }}
                      >
                        {shape}
                      </Button>
                    )}
                  </Box>
                )
              })}
            </Box>
          ))}
        </Box>
      </Paper> 
    </Popover>
  );
};


const AccdSelector = ({
  value = [],
  open,
  anchorEl,
  onChange,
  onClose,
}: {
  value?: number[];
  open: boolean;
  anchorEl: HTMLInputElement | null;
  onChange: (a: number[]) => void;
  onClose: () => void;
}) => {

  const handleClickRadio = (n: number, v: number) => {
    const newAccd = [...value].filter((a) => Math.abs(a) != n);
    if (v == 1) newAccd.push(n);
    if (v == -1) newAccd.push(-n);
    onChange(newAccd);
  };
  
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      onClose={onClose}
    >
      <Paper elevation={3} sx={{ p: 1 }}>
        <Box sx={{ display: "flex" }}>
          {Array(7).fill(0).map((z, n) => (
            <RadioGroup
              key={n}
              value={value.includes(n + 1) ? 1 : value.includes(-n - 1) ? -1 : 0}
              sx={{ mx: 1 }}
            >
              <FormControlLabel label={`${n + 1}＃`} value={1} control={<Radio />} onClick={() => handleClickRadio(n + 1, 1)} />
              <FormControlLabel label={`${n + 1}♮`} value={0} control={<Radio />} onClick={() => handleClickRadio(n + 1, 0)} />
              <FormControlLabel label={`${n + 1}♭`} value={-1} control={<Radio />} onClick={() => handleClickRadio(n + 1, -1)} />
            </RadioGroup>
          ))}
        </Box>
      </Paper>
    </Popover>
  );
};