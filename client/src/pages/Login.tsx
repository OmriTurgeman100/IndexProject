import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useThemeContext } from "../hooks/useThemeContext";
import { Typography, Box } from "@mui/material";
// import wallpaper_1 from "../assets/wallpaper_1.svg";
// import wallpaper_2 from "../assets/wallpaper_2.svg";
import wallpaper_3 from "../assets/wallpaper_3.svg";
import { FormGroup, FormControlLabel, Switch } from "@mui/material";
import { AuthUserLogin } from "../services/Login";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuthContext";
import Button from "@mui/material/Button";

export const Login = () => {
  const { theme, toggleTheme, isDarkMode } = useThemeContext();
  const location = useLocation();
  const [authUsername, setAuthUsername] = useState<string>(location.state?.username ?? "");
  const [authPassword, setAuthPassword] = useState<string>(location.state?.password ?? "");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle_username = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuthUsername(event.target.value);
  };

  const handle_password = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAuthPassword(event.target.value);
  };

  const submit_data = async () => {
    try {
      setLoading(true);
      const response = await AuthUserLogin(authUsername, authPassword);
      const token = response.data.token;

      if (token) {
        login(token);

        navigate("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ height: "100vh", display: "flex", alignItems: "center" }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          submit_data();
        }
      }}
    >
      <Box
        sx={{
          width: "50%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "15px",
            width: "500px",
          }}
        >
          <Typography
            sx={{ color: theme.palette.text.secondary, fontSize: "20px" }}
          >
            Hey👋
          </Typography>

          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "20px",
              color: theme.palette.text.secondary,
            }}
          >
            Welcome To IndexHive
          </Typography>

          <TextField
            sx={{ width: "80%" }}
            id="outlined-basic"
            label="username"
            variant="outlined"
            value={authUsername}
            onChange={handle_username}
          />

          <TextField
            sx={{ width: "80%" }}
            id="outlined-basic"
            label="password"
            variant="outlined"
            type="password"
            value={authPassword}
            onChange={handle_password}
          />

          <Button
            sx={{
              backgroundColor: "#2D5A7F",
              color: "white",
              textTransform: "none",
            }}
            onClick={submit_data}
            loading={loading}
            variant="contained"
          >
            Log in with local user
          </Button>
        </Box>
      </Box>

      {/* <img className="auth_wallpaper_1" src={wallpaper_1} alt="Logo" /> */}

      <img className="auth_wallpaper_center" src={wallpaper_3} alt="Logo" />

      <Box
        sx={{
          position: "absolute",
          right: "51%",
          bottom: 10,
          display: "flex",
          gap: "15px",
        }}
      >
        <NavLink to={"/login"}>login </NavLink>

        <NavLink
          to={"/register"}
          state={{
            username: authUsername,
            password: authPassword,
          }}
        >
          register
        </NavLink>
      </Box>

      <FormGroup sx={{ position: "absolute", bottom: 0 }}>
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
    </Box>
  );
};
