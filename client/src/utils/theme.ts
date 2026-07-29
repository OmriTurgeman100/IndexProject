// theme.ts
import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#E9ECEF",
    },
    secondary: {
      main: "#DEE2E6",
    },
    info: {
      main: "#F5F7FA",
    },
    background: {
      default: "#f8f9fa",
    },
    text: {
      primary: "#212529",
      secondary: "#343A40",
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#343A40",
    },
    secondary: {
      main: "#495057",
    },
    info: {
      main: "#3A4046",
    },
    background: {
      default: "#212529",
    },
    text: {
      primary: "#F8F9FA",
      secondary: "#E9ECEF",
    },
  },
});

export { lightTheme, darkTheme };
