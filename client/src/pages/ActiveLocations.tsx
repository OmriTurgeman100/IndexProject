import { useEffect, useState, useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { get_active_locations } from "../services/Get_Visualization_Total";
import { useThemeContext } from "../hooks/useThemeContext";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import IconButton from "@mui/material/IconButton";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
// import RealTimeLight from "../assets/RealTimeLight.svg";
// import RealTimeDark from "../assets/RealTimeDark.svg";
import TextField from "@mui/material/TextField";
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { motion } from "motion/react"

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";

interface ActiveLocations {
  id: number;
  type: string;
  name: string;
  active_location: string;
}

export const ActiveLocations = () => {
  const [entityLocations, setEntityLocations] = useState<ActiveLocations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { theme, isDarkMode } = useThemeContext();
  const [mode, setMode] = useState<string>("table");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await get_active_locations();
      setEntityLocations(response.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching active locations:", error);
    }
  };

  const redirect_to_system_or_services = (type: string, id: number): void => {
    switch (type) {
      case "service":
        navigate(`/services/view/${id}`);
        break;
      case "system":
        navigate(`/systems/view/${id}`);
        break;
    }
  };

  const handleModeChange = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filtered_entities = entityLocations.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handle_ref(): void {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }

  useEffect(() => {
    handle_ref();
    handle_redirect();
  }, [loading, mode, isDarkMode]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  function handle_redirect(): void {
    if (mode === "architecture") {
      navigate(`/tidy/tree/active_locations`);
    } else if (mode === "aggregation") {
      navigate(`/locations/aggregation`);
    } else if (mode === "aggregation/table") {
      navigate("/locations/aggregation/table")
    }
  }

  return (
    <Box>
      {loading === false ? (


        <Box
          sx={{
            m: 3,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Typography
              sx={{
                fontSize: "2rem",
                fontWeight: 700,
                background: "linear-gradient(90deg, #71b1ffff 0%, #266afdff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              חיפוש מידע בזמן אמת
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            {isDarkMode ? (
              <TextField
                inputRef={inputRef}
                sx={{
                  width: "550px",

                  "& .MuiOutlinedInput-root": {
                    background: "#000000ff",
                    borderRadius: "35px",
                    paddingLeft: "14px",
                    height: "55px",
                    boxShadow: "0 4px 18px rgba(30, 110, 255, 0.25)",

                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },

                    "&.Mui-focused": {
                      boxShadow: "0 0 18px rgba(80, 140, 255, 0.45)",
                      background: "#000000ff",
                    },
                  },

                  "& .MuiInputBase-input": {
                    fontSize: "16px",
                    padding: "0 10px",
                    color: theme.palette.text.primary,
                  },

                  "& .MuiInputBase-input::placeholder": {
                    color: "#CED4DA",
                    opacity: 1,
                  },
                }}
                placeholder="Search..."
                variant="outlined"
                value={searchQuery}
                onChange={handle_query_change}
              />
            ) : (
              <TextField
                inputRef={inputRef}
                sx={{
                  width: "550px",

                  "& .MuiOutlinedInput-root": {
                    background: "#ffffff",
                    borderRadius: "35px",
                    paddingLeft: "14px",
                    height: "55px",

                    boxShadow: "0 4px 18px rgba(55, 125, 255, 0.25)",

                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },

                    "&.Mui-focused": {
                      boxShadow: "0 0 18px rgba(30, 110, 255, 0.35)",
                      background: "#fff",
                    },
                  },

                  "& .MuiInputBase-input": {
                    fontSize: "16px",
                    padding: "0 10px",
                    color: theme.palette.text.primary,
                  },

                  "& .MuiInputBase-input::placeholder": {
                    color: "#7a8ba5",
                    opacity: 1,
                  },
                }}
                placeholder="Search..."
                variant="outlined"
                value={searchQuery}
                onChange={handle_query_change}
              />
            )}
          </motion.div>

          <TableContainer
            component={Paper}
            sx={{
              width: "800px",
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 3,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{ backgroundColor: theme.palette.background.default }}
                >
                  <TableCell
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: "bold",
                    }}
                  >
                    סוג מידע
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: "bold",
                    }}
                  >
                    שם מידע
                  </TableCell>
                  <TableCell
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: "bold",
                    }}
                  >
                    מיקום מידע
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered_entities.map((item, index) => {
                  if (!item.active_location || item.active_location.trim() === "") return null;

                  return (
                    <TableRow
                      key={index}
                      sx={{
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        {item.type}
                      </TableCell>

                      <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {item.name}
                        <IconButton
                          size="small"
                          sx={{ backgroundColor: theme.palette.background.default }}
                          onClick={() =>
                            redirect_to_system_or_services(item.type, item.id)
                          }
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </TableCell>

                      <TableCell sx={{ color: theme.palette.text.secondary }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LocationOnOutlinedIcon sx={{ color: "#007FFF" }} />
                          {item.active_location}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>

            </Table>
          </TableContainer>
        </Box>


      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <CircularProgress sx={{ color: "#007FFF" }} />
        </Box>
      )}

      <Box
        sx={{
          minWidth: 120,
          position: "fixed",
          bottom: "15px",
          left: "15px",
        }}
      >
        <FormControl fullWidth>
          <InputLabel id="demo-simple-select-label">מצב מידע</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={mode}
            label="Mode"
            onChange={handleModeChange}
          >
            <MenuItem value={"aggregation"}>מחולק</MenuItem>
            <MenuItem value={"aggregation/table"}>טבלה </MenuItem>
            <MenuItem value={"table"}>בסיסי</MenuItem>
            <MenuItem value={"architecture"}>ארכיטקטורה</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <GradientBlurLeft left_position="-100px" top_position="100px" />

      <GradientBlurRight right_position="-100px" top_position="150px" />
    </Box>
  );
};
