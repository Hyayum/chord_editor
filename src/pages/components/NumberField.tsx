import { TextField, TextFieldProps, TextFieldVariants } from "@mui/material";
import { useState } from "react";

type Props = {
    variant?: TextFieldVariants;
    children?: React.ReactNode;
  } & Omit<TextFieldProps, 'variant' | 'onFocus' | 'onBlur' | 'type'>

const NumberField = (props: Props) => {
  const [focused, setFocused] = useState(false);
  const { children, value, ...rest } = props;
  return (
    <TextField
      { ...rest }
      type="number"
      value={value || (focused ? "" : value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      { children }
    </TextField>
  );
};

export default NumberField;