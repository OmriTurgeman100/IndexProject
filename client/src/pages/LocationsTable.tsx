import { useState, useEffect, useRef } from "react";
import {
  entities_locations_table,
  entities_impact_data,
  entities_environments_data,
  entities_backup_types_data,
  entities_infrastructure_types_data,
} from "../services/Get_Visualization_Total";
import { Box, Typography, TextField } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import CircularProgress from "@mui/material/CircularProgress";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";
import { Locations_table } from "../components/Locations_table";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { useNavigate } from "react-router-dom";
// add imports
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import CircleIcon from "@mui/icons-material/Circle";
import StarIcon from "@mui/icons-material/Star";
// import CropSquareOutlinedIcon from "@mui/icons-material/CropSquareOutlined";

interface Locations {
  id: number;
  name: string;
  active_location: string | null;
  secondary_site: string | null;
  third_site: string | null;
  backup_type: string | null;
  type: "system" | "service";
  environment: string | null;
  preferred_site: string | null;
  is_preferred_location: "true" | "false";
  infrastructure_type: string;
  info: string
}

interface Impacts {
  impact: string;
}

interface Environments {
  environment: string;
}

interface Backup_types {
  backup_type: string;
}

interface InfrastructureType {
  infrastructure_type: string;
}

export const LocationsTable = () => {
  const [locations, setLocations] = useState<Locations[]>([]);
  const { theme, isDarkMode } = useThemeContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [impacts, setImpacts] = useState<Impacts[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [environments, setEnvironments] = useState<Environments[]>([]);
  const [selectedEnvs, setSelectedEnvs] = useState<string[]>([]);
  const [backuptypes, setBackupTypes] = useState<Backup_types[]>([]);
  const [selectedBackupTypes, setSelectedBackupTypes] = useState<string[]>([]);
  const [selectedIsPreferred, setSelectedIsPreferred] = useState<string[]>([]);
  const [infraTypes, setInfraTypes] = useState<InfrastructureType[]>([]);
  const [selectedInfraTypes, setSelectedInfraTypes] = useState<string[]>([]);
  const [mode, setMode] = useState<string>("aggregation/table");
  const navigate = useNavigate();

  const get_locations = async () => {
    try {
      const response = await entities_locations_table(
        selectedImpacts,
        selectedEnvs,
        selectedBackupTypes,
        selectedIsPreferred,
        selectedInfraTypes,
      );

      setLocations(response.data);

      const impacts_values = await entities_impact_data();

      setImpacts(impacts_values.data);

      const environments_values = await entities_environments_data();

      setEnvironments(environments_values.data);

      const backup_type_values = await entities_backup_types_data();

      setBackupTypes(backup_type_values.data);

      const infrastructure_types_values =
        await entities_infrastructure_types_data();

      setInfraTypes(infrastructure_types_values.data);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  function handle_ref(): void {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }

  const filtered_entities = locations.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleModeChange = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  useEffect(() => {
    get_locations();

    const interval = setInterval(get_locations, 1000);

    return () => clearInterval(interval);
  }, [
    selectedImpacts,
    selectedEnvs,
    selectedBackupTypes,
    selectedIsPreferred,
    selectedInfraTypes,
  ]);

  function handle_redirect(): void {
    if (mode === "architecture") {
      navigate(`/tidy/tree/active_locations`);
    } else if (mode === "table") {
      navigate(`/locations/table`);
    } else if (mode === "aggregation") {
      navigate(`/locations/aggregation`);
    }
  }

  useEffect(() => {
    handle_redirect();
  }, [mode]);

  useEffect(() => {
    handle_ref();
  }, [loading]);

  return (
    <Box>
      {loading === false ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20px",
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: "fit-content",
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
                  width: "150px",
                }}
                placeholder="חיפוש שם מערכת"
                variant="standard"
                value={searchQuery}
                onChange={handle_query_change}
              />
            </Box>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 165 }}>
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

            <FormControl size="small" sx={{ minWidth: 165 }}>
              <InputLabel id="env-label">סביבה </InputLabel>

              <Select
                sx={{ borderRadius: 15 }}
                labelId="env-label"
                multiple
                value={selectedEnvs}
                label="סביבה"
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedEnvs(
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
                      checked={selectedEnvs.includes(i.environment)}
                    />
                    <ListItemText primary={i.environment} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 165 }}>
              <InputLabel id="backup-label">גיבוי </InputLabel>

              <Select
                sx={{ borderRadius: 15 }}
                labelId="backup-label"
                multiple
                value={selectedBackupTypes}
                label="סוג גיבוי"
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedBackupTypes(
                    typeof value === "string" ? value.split(",") : value,
                  );
                }}
              >
                {backuptypes.map((i) => (
                  <MenuItem key={i.backup_type} value={i.backup_type}>
                    <Checkbox
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": {
                          color: "#1976d2",
                        },
                      }}
                      checked={selectedBackupTypes.includes(i.backup_type)}
                    />
                    <ListItemText
                      primary={i.backup_type}
                      sx={{ direction: "rtl" }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 165 }}>
              <InputLabel id="preferred-site-label">נמצא באתר מועדף</InputLabel>

              <Select
                sx={{ borderRadius: 15 }}
                labelId="preferred-site-label"
                multiple
                value={selectedIsPreferred}
                label="אתר מועדף"
                renderValue={(selected) =>
                  selected
                    .map((val) => (val === "true" ? "כן" : "לא"))
                    .join(", ")
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedIsPreferred(
                    typeof value === "string" ? value.split(",") : value,
                  );
                }}
              >
                {[
                  { value: "false", label: "לא" },
                  { value: "true", label: "כן" },
                ].map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": {
                          color: "#1976d2",
                        },
                      }}
                      checked={selectedIsPreferred.includes(option.value)}
                    />
                    <ListItemText primary={option.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <FormControl size="small" sx={{ minWidth: 165 }}>
              <InputLabel id="backup-label">תשתית </InputLabel>

              <Select
                sx={{ borderRadius: 15 }}
                labelId="backup-label"
                multiple
                value={selectedInfraTypes}
                label="תשתית"
                renderValue={(selected) => selected.join(", ")}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedInfraTypes(
                    typeof value === "string" ? value.split(",") : value,
                  );
                }}
              >
                {infraTypes.map((i) => (
                  <MenuItem
                    key={i.infrastructure_type}
                    value={i.infrastructure_type}
                  >
                    <Checkbox
                      sx={{
                        color: "#1976d2",
                        "&.Mui-checked": {
                          color: "#1976d2",
                        },
                      }}
                      checked={selectedInfraTypes.includes(
                        i.infrastructure_type,
                      )}
                    />
                    <ListItemText primary={i.infrastructure_type} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider orientation="vertical" flexItem />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: theme.palette.background.default,
                  padding: 1,
                  borderRadius: 5,
                }}
              >
                <Typography>אתר מועדף</Typography>

                <StarIcon
                  fontSize="small"
                  sx={{
                    color: "#FFD966",
                    filter: "drop-shadow(0 0 2px rgba(0,0,0,0.75))",
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: theme.palette.background.default,
                  padding: 1,
                  borderRadius: 5,
                }}
              >
                <Typography> פעיל</Typography>

                <CircleIcon
                  fontSize="small"
                  sx={{ color: theme.palette.success.light }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: theme.palette.background.default,
                  padding: 1,
                  borderRadius: 5,
                }}
              >
                <Typography>לא פעיל</Typography>

                <CircleIcon
                  fontSize="small"
                  sx={{ color: theme.palette.warning.light }}
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: theme.palette.background.default,
                  padding: 1,
                  borderRadius: 5,
                }}
              >
                <Typography>לא באתר המועדף</Typography>

                <CircleIcon fontSize="small" sx={{ color: "#d32f2f" }} />
              </Box>
            </Box>
          </Box>

          <Locations_table locations={filtered_entities}></Locations_table>
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
