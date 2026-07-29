import {
  locations_aggregation,
  entities_locations_aggregation,
  total_locations_aggregation,
  entities_impact_data,
  entities_environments_data,
} from "../services/Get_Visualization_Total";
import { useEffect, useState, useRef } from "react";
import { DisplayLocations } from "../components/DisplayLocations";
import { Box, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";
import TextField from "@mui/material/TextField";
import { useThemeContext } from "../hooks/useThemeContext";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

interface Locations {
  location: string;
  tag: string;
  count: string;
  environments: Environment[];
}

interface Environment {
  environment: string;
  count: number;
  items: Item[];
}

interface Item {
  id: number;
  name: string;
  type: string;
  backup: string;
  infrastructure: string | null;
  tag: string;
}

interface Impacts {
  impact: string;
}

interface Environments {
  environment: string;
}

export const Locations = () => {
  const [locations, setLocations] = useState<Locations[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mode, setMode] = useState<string>("aggregation");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { theme, isDarkMode } = useThemeContext();
  const [locationsMode, setLocationsMode] = useState<string>("total_locations");
  const [impacts, setImpacts] = useState<Impacts[]>([]);
  const [environments, setEnvironments] = useState<Environments[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    [],
  );

  const handleModeChange = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleLocationsModeChange = (event: SelectChangeEvent): void => {
    setLocationsMode(event.target.value as string);
  };

  const get_locations = async () => {
    try {
      const impacts_values = await entities_impact_data();

      setImpacts(impacts_values.data);

      const environments_values = await entities_environments_data();

      setEnvironments(environments_values.data);

      if (locationsMode === "total_locations") {
        const response = await total_locations_aggregation(
          selectedImpacts,
          selectedEnvironments,
        );

        if (response.data.length == 0) {
          setLocationsMode("active_locations");
          return;
        }

        setLocations(response.data);

        setLoading(false);
      } else if (locationsMode === "active_locations") {
        const response = await locations_aggregation(
          selectedImpacts,
          selectedEnvironments,
        );

        setLocations(response.data);

        setLoading(false);
      } else {
        const response = await entities_locations_aggregation(
          selectedImpacts,
          selectedEnvironments,
        );

        if (response.data.length == 0) {
          setLocationsMode("active_locations");
          return;
        }

        setLocations(response.data);

        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  function handle_redirect(): void {
    if (mode === "architecture") {
      navigate(`/tidy/tree/active_locations`);
    } else if (mode === "table") {
      navigate(`/locations/table`);
    } else if (mode === "aggregation/table") {
      navigate("/locations/aggregation/table");
    }
  }

  const filteredLocations = locations.map((loc) => ({
    ...loc,
    environments: loc.environments.map((env) => ({
      ...env,
      items: env.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    })),
  }));

  function handle_ref(): void {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }

  const focusSearchInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    get_locations();

    const interval = setInterval(get_locations, 1000);

    return () => clearInterval(interval);
  }, [locationsMode, selectedImpacts, selectedEnvironments]);

  useEffect(() => {
    handle_redirect();
  }, [mode]);

  useEffect(() => {
    handle_ref();
  }, [loading, locationsMode]);

  return (
    <Box>
      {loading === false ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "90vh",
            alignItems: "center",
            mt: "25px",
            px: 3,
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: "1500px",
              backgroundColor: theme.palette.background.paper,
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "10px 20px",
              borderRadius: "35px",

              boxShadow: isDarkMode
                ? "0 4px 25px rgba(80, 140, 255, 0.25)"
                : "0 4px 25px rgba(30, 110, 255, 0.20)",

              backdropFilter: "blur(12px)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SearchIcon />

              <TextField
                inputRef={inputRef}
                slotProps={{
                  input: {
                    disableUnderline: true,
                  },
                }}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "16px",
                    color: theme.palette.text.primary,
                    padding: "4px 0",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: isDarkMode ? "#a1a7b3" : "#7a8ba5",
                    opacity: 1,
                  },
                  background: "transparent",
                  width: "250px",
                }}
                placeholder="Search"
                variant="standard"
                value={searchQuery}
                onChange={handle_query_change}
              />
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ minWidth: 200 }}>
              <FormControl
                fullWidth
                sx={{
                  "& .MuiInputLabel-root": {
                    fontSize: "14px",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    height: "42px",
                    paddingRight: "8px",
                  },
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              >
                <InputLabel id="demo-simple-select-label">מצב מידע</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={locationsMode}
                  label="Mode"
                  onChange={handleLocationsModeChange}
                  variant="outlined"
                >
                  <MenuItem value={"total_locations"}>
                    מיקום כללי - מיקום כללי - מיקום כללי
                  </MenuItem>
                  <MenuItem value={"active_locations"}>
                    מיקום נוכחי - מיקום נוכחי - מיקום נוכחי
                  </MenuItem>
                  <MenuItem value={"entities_locations"}>
                    מיקום נוכחי - אתר משני - אתר שלישי
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="impact-label">רמת השפעה</InputLabel>

              <Select
                sx={{ borderRadius: 15 }}
                labelId="impact-label"
                multiple
                value={selectedImpacts}
                label="רמת השפעה"
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedImpacts(
                    typeof value === "string" ? value.split(",") : value,
                  );
                }}
              >
                {impacts.map((i) => (
                  <MenuItem key={i.impact} value={i.impact}>
                    <Checkbox
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": {
                          color: "#1976d2",
                        },
                      }}
                      checked={selectedImpacts.includes(i.impact)}
                    />
                    <ListItemText primary={i.impact} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="environment-label"> סביבה</InputLabel>

              <Select
                sx={{ borderRadius: 15 }}
                labelId="impact-label"
                multiple
                value={selectedEnvironments}
                label="סביבה"
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedEnvironments(
                    typeof value === "string" ? value.split(",") : value,
                  );
                }}
              >
                {environments.map((i) => (
                  <MenuItem key={i.environment} value={i.environment}>
                    <Checkbox
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": {
                          color: "#1976d2",
                        },
                      }}
                      checked={selectedEnvironments.includes(i.environment)}
                    />
                    <ListItemText primary={i.environment} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 700,
                background:
                  "linear-gradient(90deg, #60A5FA 0%, #4983ffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textAlign: "center",
                marginLeft: "50px",
              }}
            >
              דשבורד זמן אמת
            </Typography>
          </Box>

          <DisplayLocations
            handle_query_change={handle_query_change}
            locations={filteredLocations}
            searchQuery={searchQuery}
            focusSearchInput={focusSearchInput}
          ></DisplayLocations>
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
