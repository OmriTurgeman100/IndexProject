import { Cert_Bar } from "../components/Cert_Bar";
import { Network_Bar } from "../components/Network_Types_Bar";
import { System_Auth_Bar } from "../components/System_Auth_Bar";
import { System_Infanstructure_Bar } from "../components/System_Infanstructure_Bar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useThemeContext } from "../hooks/useThemeContext";
import { get_service_and_systems_fields } from "../services/Get_Api_Fields";
import cube from "../assets/cube.svg";
import shoham_logo_light from "../assets/shoham_logo_light.svg";
import shoham_logo_dark from "../assets/shoham_logo_dark.svg";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SettingsIcon from "@mui/icons-material/Settings";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import DoneIcon from "@mui/icons-material/Done";
import { total_services_and_systems } from "../services/Get_Vis_Menu";
import CloseIcon from "@mui/icons-material/Close";
import {
  custom_services_systems,
  advanced_services_systems,
  field_suggestions,
  field_source
} from "../services/Get_Visualization_Total";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Skeleton from "@mui/material/Skeleton";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Box,
  TextField,
} from "@mui/material";
import { DisplayEntities } from "../components/DisplayEntities";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";

interface MenuFields {
  field: string;
  translation: string;
}

interface menu {
  name: string;
  id: number;
  type: string;
}

interface fields_suggestion {
  match: string
}

interface fields_source {
  match: string
  source: string
  translation: string
}

export const Home = () => {
  const { theme, isDarkMode } = useThemeContext();
  const [menuFields, setMenuFields] = useState<MenuFields[]>([]);
  const [menu, setMenu] = useState<menu[]>([]);
  const [SelectedField, setSelectedField] = useState<string>();
  const [showSettings, setshowSettings] = useState<boolean>(false);
  const [hasFilter, setHasFilter] = useState<boolean>(false);
  const [formData, setFormData] = useState<string>("");
  const [entities, setEntities] = useState<menu[]>([]);
  const [displayEntities, setDisplayEntities] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [HebrewField, setHebrewField] = useState<string | undefined>("");
  const [displayFooter, setDisplayFooter] = useState<boolean>(true);
  const [advancedSettings, setAdvancedSettings] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [filtersUi, setFiltersUi] = useState<Record<string, string>>({}); // ! This is only used for displaying filters in the UI and has no functional impact.
  const [mode, setMode] = useState<string>("new");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [fieldSuggestions, setFieldSuggestions] = useState<fields_suggestion[]>([])
  const [fieldSource, setFieldSource] = useState<fields_source[]>([])

  const fetch_fields = async () => {
    try {
      const response = await get_service_and_systems_fields();

      setMenuFields(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await total_services_and_systems();

      setMenu(response.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
    }
  };


  const handle_field_suggestion = async (value: string) => {
    try {

      if (!value.trim()) {
        setFieldSuggestions([]);
        return;
      }

      const response = await field_suggestions(SelectedField ?? "name", value)

      setFieldSuggestions(response.data)

    } catch (error) {
      console.error(error)
    }
  }

  const handle_field_source = async (value: string) => {
    try {

      if (!value.trim()) {
        setFieldSource([]);
        return;
      }

      const response = await field_source(value)

      setFieldSource(response.data)

    } catch (error) {
      console.error(error)
    }
  }


  const handleModeChange = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  const handle_change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(event.target.value);

    await handle_field_suggestion(event.target.value)

    await handle_field_source(event.target.value)
  };

  function handle_settings(): void {
    setshowSettings((prev) => !prev);
  }

  function apply_settings(): void {
    setshowSettings((prev) => !prev);

    setHasFilter(true);
  }

  const handle_submit = async (): Promise<void> => {
    try {
      if (hasFilter === false) {
        const matchedRegex = menu.filter(({ name }) =>
          name.toLowerCase().startsWith(formData.toLowerCase())
        );

        // ! should test it, if it finds more than 1 entity which starts with same regex, it will display names .
        if (matchedRegex.length > 1) {
          setDisplayFooter(false);

          const response = await custom_services_systems("name", formData);

          setEntities(response.data);

          setDisplayEntities(true);
        } else {
          const result = menu.find(({ name }) =>
            name.toLowerCase().includes(formData.toLowerCase())
          );

          const entity_type: string | undefined = result?.type;

          const entity_id: number | undefined = result?.id;

          if (entity_type === "system") {
            navigate(`/systems/view/${entity_id}`);
          } else if (entity_type === "service") {
            navigate(`/services/view/${entity_id}`);
          }
        }
      } else {
        setDisplayFooter(false);

        const response = await custom_services_systems(SelectedField, formData);

        setFiltersUi({ [SelectedField as string]: formData });

        setEntities(response.data);

        setDisplayEntities(true);
      }
    } catch (error) {
      console.error(error);
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

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedField(event.target.value as string);

    const selectedValue = event.target.value as string;

    const Item = menuFields.find((item) => item.field === selectedValue);

    setHebrewField(Item?.translation);
  };

  function display_advanced_settings() {
    setHasFilter(false);
    setshowSettings(false);

    setAdvancedSettings(true);
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterSubmit = async () => {
    try {
      setFiltersUi(filters);
      const entries = Object.entries(filters).filter(
        ([_, v]) => v.trim() !== ""
      );
      const query = entries
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");

      const response = await advanced_services_systems(query);

      setEntities(response.data);
      setDisplayEntities(true);
      setDisplayFooter(false);
    } catch (error) {
      console.error("Advanced filter fetch failed:", error);
    }
  };

  function handle_close_filter(): void {
    setAdvancedSettings(false);
    setDisplayEntities(false);
    setshowSettings(false);
  }

  function handle_ref(): void {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function handle_exit(): void {
    setFiltersUi({});
    setDisplayEntities(false);

    setDisplayFooter(true);
  }


  function handle_source_apply(selected_source_field: string, match: string): void {

    setFormData(match);
    setFieldSource([]);

    setSelectedField(selected_source_field);

    const selectedValue = selected_source_field;

    const Item = menuFields.find((item) => item.field === selectedValue);

    setHebrewField(Item?.translation);

    // setshowSettings((prev) => !prev);

    setHasFilter(true);

  }

  useEffect(() => {
    handle_ref();

    fetchData();
    fetch_fields();
  }, [showSettings, hasFilter, advancedSettings, isDarkMode, displayEntities, fieldSuggestions, fieldSource]);

  return (
    <div>
      {displayEntities === false ? (
        <Box
          sx={{
            display: "flex",
            margin: "15px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "15px",
              }}
            >
              <img
                src={cube}
                alt="Logo"
                style={{
                  height: "40px",
                }}
              />

              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "20px",
                }}
              >
                IndexHive ברוך הבא ל
              </Typography>
            </Box>

            {showSettings === false &&
              advancedSettings === false &&
              hasFilter === false ? (
              <Typography sx={{ textAlign: "center", fontSize: "15px" }}>
                אנא בחר מערכת או שירות
              </Typography>
            ) : showSettings === true ? (
              <Typography sx={{ textAlign: "center", fontSize: "15px" }}>
                ניתן לפלטר מערכת או שירות לפי בחירת שדה
              </Typography>
            ) : showSettings === false && hasFilter === true ? (
              <Typography sx={{ textAlign: "center", fontSize: "15px" }}>
                נא לציין {HebrewField}
              </Typography>
            ) : null}

            {showSettings === false && advancedSettings === false ? (
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    width: "fit-content",
                    display: "flex",
                    gap: "5px",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      width: "500px",
                      borderRadius: "35px",
                      padding: "10px 15px",
                      height: "100px",
                    }}
                  >
                    <TextField
                      inputRef={inputRef}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && formData.length > 0) {
                          handle_submit();
                        }
                      }}
                      variant="outlined"
                      placeholder="Search..."
                      sx={{
                        width: "100%",
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
                      value={formData}
                      onChange={handle_change}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "15px",
                        }}
                      >
                        <IconButton
                          onClick={handle_settings}
                          sx={{
                            color: theme.palette.text.primary,
                            transition:
                              "transform 0.3s ease, background-color 0.3s ease",
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                              transform: "rotate(15deg)",
                            },
                          }}
                        >
                          <SettingsIcon />
                        </IconButton>

                        <Typography sx={{ fontSize: "15px" }}>
                          הגדרות
                        </Typography>
                      </Box>

                      <Tooltip
                        title={formData.length === 0 ? "נא לציין מידע" : ""}
                      >
                        <span
                          style={{
                            cursor:
                              formData.length === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          <IconButton
                            onClick={handle_submit}
                            sx={{
                              backgroundColor: "#4A6CFF",
                              transition: "all 0.2s ease-in-out",
                              "&:hover": {
                                backgroundColor: "#4A6CFF",
                                transform: "translateY(-2px) scale(1.01)",
                                boxShadow:
                                  "0px 4px 12px rgba(74, 108, 255, 0.4)",
                              },
                              "&.Mui-disabled": {
                                backgroundColor: "#4A6CFF",
                                opacity: "20%",
                              },
                            }}
                            disabled={formData.length === 0}
                          >
                            <ArrowUpwardIcon sx={{ color: "white" }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {formData.trim().length > 0 && fieldSuggestions.length > 0 ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      maxHeight: "300px",
                      height: "fit-content",
                      left: 0,
                      width: "100%",
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      overflow: "auto",
                      zIndex: 20,
                    }}
                  >
                    {fieldSuggestions.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          setFormData(item.match);
                          setFieldSuggestions([]);
                          setFieldSource([])
                        }}
                        sx={{
                          px: 2,
                          py: 1,
                          cursor: "pointer",
                          "&:hover": { backgroundColor: theme.palette.action.hover },
                          textAlign: "right",
                          direction: "rtl"
                        }}
                      >
                        {item.match}
                      </Box>
                    ))}
                  </Box>
                ) : formData.trim().length > 0 &&
                  fieldSuggestions.length === 0 &&
                  fieldSource.length > 0 ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      maxHeight: "300px",
                      height: "fit-content",
                      left: 0,
                      width: "100%",
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      overflow: "auto",
                      zIndex: 20,
                    }}
                  >
                    {fieldSource.map((item, index) => (
                      <Box
                        key={index}
                        onClick={() => {
                          handle_source_apply(item.source, item.match)
                        }}
                        sx={{
                          px: 2,
                          py: 1.2,
                          cursor: "pointer",
                          "&:hover": { backgroundColor: theme.palette.action.hover },
                          textAlign: "right",
                          direction: "rtl",
                        }}
                      >
                        <Box sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <Typography sx={{ fontWeight: 600, fontSize: "15px" }}>
                            {item.match}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: "13px",
                              color: theme.palette.text.secondary,
                            }}
                          >
                            נמצא תחת {item.translation}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Box>
            ) : showSettings === true && advancedSettings === false ? (
              <Box
                sx={{
                  display: "flex",
                  width: "300px",
                  gap: "1px",
                  marginRight: "30px",
                  marginBottom: "44px",
                  position: "relative",
                }}
              >
                <IconButton onClick={handle_settings}>
                  <CloseIcon />
                </IconButton>

                <Box sx={{ minWidth: "90%" }}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">field</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={SelectedField}
                      label="Field"
                      onChange={handleChange}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            overflowY: "auto",
                          },
                        },
                      }}
                    >
                      {menuFields.map((item) => (
                        <MenuItem key={item.field} value={item.field}>
                          {item.translation}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <IconButton onClick={apply_settings}>
                  <DoneIcon />
                </IconButton>

                <IconButton
                  sx={{
                    position: "absolute",
                    top: 70,
                    right: "35%",
                    backgroundColor: theme.palette.primary.main,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={display_advanced_settings}
                >
                  <SettingsSuggestIcon />
                </IconButton>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {menuFields.map(({ field, translation }) => (
                  <TextField
                    sx={{ width: "200px" }}
                    key={field}
                    label={translation}
                    value={filters[field] || ""}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                    variant="outlined"
                  />
                ))}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <IconButton
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                    }}
                    onClick={handleFilterSubmit}
                  >
                    <DoneIcon />
                  </IconButton>

                  <IconButton
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                    }}
                    onClick={handle_close_filter}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            margin: "20px",
            gap: 3,
          }}
        >
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
                <MenuItem value={"new"}>חדש</MenuItem>
                <MenuItem value={"old"}>ישן</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {mode === "new" ? (
            <DisplayEntities
              entities={entities}
              redirect={redirect_to_system_or_services}
              filters={filtersUi}
              exit={handle_exit} // ! check if it cleans fields good enough.
              menu={menuFields}
            ></DisplayEntities>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={handle_exit}
                  sx={{ backgroundColor: theme.palette.secondary.main }}
                >
                  <CloseIcon />
                </IconButton>

                <Typography>תוצאות</Typography>
              </Box>

              <Accordion
                defaultExpanded
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  width: "750px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                ></AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Title</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Type</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {entities.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <TableCell>{item.type}</TableCell>

                              <IconButton
                                onClick={() =>
                                  redirect_to_system_or_services(
                                    item.type,
                                    item.id
                                  )
                                }
                                sx={{
                                  backgroundColor: theme.palette.primary.main,
                                }}
                              >
                                <ArrowDropUpIcon />
                              </IconButton>
                            </Box>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Box>
      )}

      {displayEntities === false ? (
        <Box
          sx={{
            height: "27vh",
            padding: "15px",
            overflow: "auto",
          }}
        >
          {loading === false ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                borderRadius: "5px",
                gap: "15px",
                padding: "20px",
              }}
            >
              {menu.map((item) => (
                <Paper
                  key={item.name}
                  sx={{
                    height: "fit-content",
                    width: "fit-content",
                    padding: "15px",
                    cursor: "pointer",
                    transition: "transform 0.3s ease",
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                    },
                  }}
                  onClick={() => {
                    redirect_to_system_or_services(item.type, item.id);
                  }}
                >
                  <Typography>{item.name}</Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                borderRadius: "5px",
                gap: "15px",
                padding: "20px",
              }}
            >
              {[...Array(128)].map((_, index) => (
                <Skeleton key={index} variant="text" width={100} height={70} />
              ))}
            </Box>
          )}
        </Box>
      ) : null}

      <GradientBlurLeft left_position="-100px" top_position="120px" />

      <GradientBlurRight right_position="-100px" top_position="170px" />

      {displayEntities === false ? (
        <div className="visualization_grid">
          <Paper
            elevation={1}
            sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
          >
            <Cert_Bar />
          </Paper>

          <Paper
            elevation={1}
            sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
          >
            <Network_Bar />
          </Paper>

          <Paper
            elevation={1}
            sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
          >
            <System_Auth_Bar />
          </Paper>

          <Paper
            elevation={1}
            sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
          >
            <System_Infanstructure_Bar />
          </Paper>
        </div>
      ) : null}

      {displayFooter === true ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "99px",
            backgroundColor: theme.palette.primary.main,
          }}
        >
          {isDarkMode ? (
            <img
              src={shoham_logo_dark}
              alt="Logo"
              style={{
                height: "60px",
              }}
            />
          ) : (
            <img
              src={shoham_logo_light}
              alt="Logo"
              style={{
                height: "60px",
              }}
            />
          )}
        </Box>
      ) : null}
    </div>
  );
};
