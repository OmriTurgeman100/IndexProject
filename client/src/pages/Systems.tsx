import { useEffect, useState, useRef } from "react";
import { get_systems_menu } from "../services/Get_Systems_Menu";
import { Typography, Box, Paper } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import TextField from "@mui/material/TextField";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import DoneIcon from "@mui/icons-material/Done";
import IconButton from "@mui/material/IconButton";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useNavigate } from "react-router-dom";
import ExpandCircleDownIcon from "@mui/icons-material/ExpandCircleDown";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { create_system_with_name } from "../services/System";

interface systems_menu {
  system_id: number;
  system_name: string;
}

export const Systems = () => {
  const [menu, setMenu] = useState<systems_menu[]>([]);
  const [formData, setFormData] = useState<string>("");
  const [displaySettings, setDisplaySettings] = useState<boolean>(false);
  const [displayPostForm, setDisplayPostForm] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { theme, isDarkMode } = useThemeContext();

  const fetch_data = async () => {
    try {
      const response = await get_systems_menu();

      setMenu(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(event.target.value);
  };

  const handle_submit = () => {
    const result = menu.find(({ system_name }) =>
      system_name.toLowerCase().includes(formData.toLowerCase())
    );

    const id: number | undefined = result?.system_id;

    navigate(`/systems/${id}`);
  };

  const handle_menu_submit = (item_id: number) => {
    navigate(`/systems/${item_id}`);
  };

  function handle_menu(): void {
    setDisplayPostForm(false);
    setDisplaySettings((prev) => !prev);
  }
  function handle_post_system(): void {
    setDisplaySettings(false);
    setDisplayPostForm((prev) => !prev);
  }

  const post_system = async () => {
    try {
      await create_system_with_name(formData);

      setDisplayPostForm((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_ref(): void {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  useEffect(() => {
    handle_ref();

    fetch_data();
  }, [displayPostForm, displaySettings, isDarkMode]);

  return (
    <div>
      {displaySettings === false && displayPostForm === false ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LightbulbIcon
                sx={{
                  color: "#0096FF",
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                }}
              />
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                שלום, כאן ניתן לחפש מידע על המערכת שלכם
              </Typography>
            </Box>
            <Typography sx={{ textAlign: "center", fontSize: "15px" }}>
              אנא בחר מערכת
            </Typography>
            <Box
              sx={{
                width: "fit-content",
                display: "flex",
                gap: "5px",
              }}
            >
              <TextField
                inputRef={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.length > 0) {
                    handle_submit();
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  width: "500px",
                  borderRadius: "35px",
                  padding: "10px 15px",
                  "& .MuiInputBase-root": {
                    fontSize: "16px",
                    fontWeight: 400,
                  },
                  "& .MuiInputBase-input": {
                    padding: "0 10px",
                    color: theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .Mui-focused": {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  },
                }}
                variant="outlined"
                value={formData}
                onChange={handle_change}
                placeholder="Search..."
              />

              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={handle_submit}
              >
                <DoneIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : displayPostForm === false ? (
        <Box
          sx={{
            height: "90vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "700px",
              alignItems: "center",
            }}
          >
            <Box sx={{ margin: "auto" }}>
              <Typography
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                מערכות ספיר
              </Typography>
              <Typography
                sx={{
                  fontSize: "15px",
                  textAlign: "center",
                }}
              >
                בחירת מערכת מהתפריט
              </Typography>
            </Box>

            <IconButton
              onClick={() => setDisplaySettings(false)}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              <ExpandCircleDownIcon />
            </IconButton>
          </Box>

          <Paper
            sx={{
              backgroundColor: theme.palette.primary.main,
              height: "500px",
              width: "750px",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
              borderRadius: 5,
              padding: 2,
              gap: "15px",
            }}
          >
            {menu.map((item) => (
              <Paper
                sx={{
                  padding: "10px",
                  backgroundColor: theme.palette.secondary.main,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "15px",
                  }}
                >
                  {item.system_name}
                </Typography>

                <IconButton
                  sx={{ backgroundColor: theme.palette.primary.main }}
                  onClick={() => handle_menu_submit(item.system_id)}
                >
                  <ArrowDropUpIcon />
                </IconButton>
              </Paper>
            ))}
          </Paper>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AddCircleIcon
                sx={{
                  color: "#0096FF",
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                }}
              />
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                שלום, כאן ניתן להוסיף את המערכת שלכם
              </Typography>
            </Box>
            <Typography sx={{ textAlign: "center", fontSize: "15px" }}>
              אנא כתוב את שם המערכת
            </Typography>
            <Box
              sx={{
                width: "fit-content",
                display: "flex",
                gap: "5px",
              }}
            >
              <TextField
                inputRef={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.length > 0) {
                    handle_submit();
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  width: "500px",
                  borderRadius: "35px",
                  padding: "10px 15px",
                  "& .MuiInputBase-root": {
                    fontSize: "16px",
                    fontWeight: 400,
                  },
                  "& .MuiInputBase-input": {
                    padding: "0 10px",
                    color: theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .Mui-focused": {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                  },
                }}
                variant="outlined"
                value={formData}
                onChange={handle_change}
                placeholder="Name..."
              />

              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={post_system}
              >
                <DoneIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      <IconButton
        sx={{
          backgroundColor: theme.palette.secondary.main,
          position: "fixed",
          right: 40,
          bottom: 20,
        }}
        onClick={handle_menu}
      >
        <TroubleshootIcon sx={{ color: theme.palette.text.primary }} />
      </IconButton>

      <IconButton
        sx={{
          backgroundColor: theme.palette.secondary.main,
          position: "fixed",
          right: 40,
          bottom: 80,
        }}
        onClick={handle_post_system}
      >
        <AddIcon sx={{ color: theme.palette.text.primary }} />
      </IconButton>
    </div>
  );
};
