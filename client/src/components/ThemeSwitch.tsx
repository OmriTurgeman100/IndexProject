import { FormGroup, FormControlLabel, Switch } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";

export default function CustomizedSwitches() {
  const { toggleTheme, isDarkMode } = useThemeContext();

  return (
    <FormGroup sx={{ position: "absolute", right: 745 }}>
      <FormControlLabel
        control={
          <Switch
            sx={{
              m: 1,
              "& .MuiSwitch-switchBase": {
                color: isDarkMode ? "#E9ECEF" : "#adb5bd",
                "&.Mui-checked": {
                  color: isDarkMode ? "#0d6efd" : "#FFC107",
                },
                "&.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: isDarkMode ? "#0d6efd" : "#FFC107",
                },
              },
              "& .MuiSwitch-track": {
                backgroundColor: isDarkMode ? "#343A40" : "#DEE2E6",
              },
            }}
            checked={isDarkMode}
            onChange={toggleTheme}
            name="themeSwitch"
            color="default"
          />
        }
        label=""
        sx={{
          color: isDarkMode ? "#E9ECEF" : "#212529",
          fontSize: "1.1rem",
        }}
      />
    </FormGroup>
  );
}
