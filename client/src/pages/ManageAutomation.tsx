import { get_current_user } from "../services/UsersData";
import { useState, useEffect } from "react";
import { scripts_menu } from "../services/Get_Visualization_Total";
import { Box, Typography } from "@mui/material";
import { EditScript } from "../components/EditScript";
import Alert from "@mui/material/Alert";
import { useThemeContext } from "../hooks/useThemeContext";
import code from "../assets/code.svg";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

interface user {
  id: number;
  username: string;
  role: string;
  access_scope: string;
  script_execution_scope: string;
}

interface menu {
  title: string;
  id: number;
  type: string;
  description: string;
  entity_name: string;
  entity_id: number;
  filename: string;
}

export const ManageAutomation = () => {
  const [currentUser, setCurrentUser] = useState<user>();
  const [menu, setMenu] = useState<menu[]>([]);
  const [selectedScript, setSelectedScript] = useState<menu>();
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { theme, isDarkMode } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetch_current_user = async () => {
    try {
      const response = await get_current_user();

      setCurrentUser(response.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_scripts_menu = async () => {
    try {
      const response = await scripts_menu();

      setMenu(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_open_edit_script(script: menu) {
    setSelectedScript(script);
    setOpenEdit(true);
  }

  function handle_close_script() {
    setRefresh((prev) => !prev);
    setOpenEdit(false);
  }

  const filtered_scripts = menu.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    fetch_current_user();
    fetch_scripts_menu();
  }, [refresh]);

  return (
    <Box>
      {currentUser && currentUser?.role != "admin" ? (
        <Alert severity="error">Access denied.</Alert>
      ) : (
        <Box sx={{ padding: "15px" }}>
          <Alert severity="success">Authorized.</Alert>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: "34px",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              mt: "20px",
            }}
          >
            Manage Scripts
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: 1.6,
              color: "#6B7280",
            }}
          >
            Easily view, update, and remove scripts
          </Typography>

          <TextField
            autoFocus
            variant="outlined"
            value={searchQuery}
            onChange={handle_query_change}
            placeholder="Search by title or description..."
            sx={{
              width: "20%",
              mt: "20px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "999px",
                backgroundColor: theme.palette.background.paper,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              width: "100%",
              mt: "25px",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            {filtered_scripts.map((item) => (
              <Box
                sx={{
                  width: "310px",
                  height: "200px",
                  borderRadius: 3,
                  padding: 2,
                  backgroundColor: theme.palette.background.paper,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",

                  boxShadow: isDarkMode
                    ? "0 4px 20px rgba(0,0,0,0.35)"
                    : "0 4px 12px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)",

                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: isDarkMode
                      ? "0 8px 30px rgba(0,0,0,0.55)"
                      : "0 10px 25px rgba(0,0,0,0.12), 0 20px 40px rgba(0,0,0,0.15)",
                  },
                }}
                key={item.id}
                onClick={() => handle_open_edit_script(item)}
              >
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    bgcolor: isDarkMode
                      ? "rgba(100, 149, 237, 0.15)"
                      : "rgba(25, 118, 210, 0.08)",
                  }}
                >
                  <img src={code} style={{ width: 50, height: 50 }} />
                </Box>

                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 500,
                    direction: "rtl",

                    letterSpacing: "0.3px",
                    lineHeight: 1.4,
                  }}
                >
                  {item.title}
                </Typography>

                <Chip
                  label={`${item.entity_name}`}
                  sx={{
                    px: 1.5,
                    height: 36,
                    fontWeight: 600,
                    fontSize: "0.85rem",

                    color: "#6D28D9",
                    border: "1px solid rgba(139,92,246,0.4)",
                    background:
                      "linear-gradient(135deg, rgba(196,181,253,0.3), rgba(139,92,246,0.15))",

                    "& .MuiChip-icon": {
                      color: "#8B5CF6",
                    },

                    "&:hover": {
                      background:
                        "linear-gradient(135deg, rgba(196,181,253,0.45), rgba(139,92,246,0.25))",
                      borderColor: "#8B5CF6",
                    },
                  }}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    label={`${item.type}`}
                    sx={{
                      px: 1.5,
                      height: 36,
                      fontWeight: 600,
                      fontSize: "0.85rem",

                      color:
                        item.type?.toLowerCase() === "service"
                          ? "#0284C7"
                          : "#2563EB",

                      border:
                        item.type?.toLowerCase() === "service"
                          ? "1px solid rgba(56,189,248,0.4)"
                          : "1px solid rgba(79,108,247,0.35)",

                      background:
                        item.type?.toLowerCase() === "service"
                          ? "linear-gradient(135deg, rgba(186,230,253,0.4), rgba(125,211,252,0.25))"
                          : "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(37,99,235,0.15))",

                      "& .MuiChip-icon": {
                        color:
                          item.type?.toLowerCase() === "service"
                            ? "#38BDF8"
                            : "#4F6CF7",
                      },

                      "&:hover": {
                        background:
                          item.type?.toLowerCase() === "service"
                            ? "linear-gradient(135deg, rgba(186,230,253,0.6), rgba(125,211,252,0.35))"
                            : "linear-gradient(135deg, rgba(96,165,250,0.25), rgba(37,99,235,0.25))",

                        borderColor:
                          item.type?.toLowerCase() === "service"
                            ? "#38BDF8"
                            : "#4F6CF7",
                      },
                    }}
                  />

                  <Chip
                    label={`${item.filename}`}
                    sx={{
                      px: 1.5,
                      height: 36,

                      fontWeight: 600,
                      fontSize: "0.85rem",

                      color: "#8B6F00",
                      border: "1px solid rgba(255, 212, 59, 0.6)",
                      background:
                        "linear-gradient(135deg, rgba(255, 212, 59, 0.25), rgba(255, 193, 7, 0.15))",

                      "& .MuiChip-icon": {
                        color: "#3776AB",
                      },

                      "&:hover": {
                        background:
                          "linear-gradient(135deg, rgba(255, 212, 59, 0.4), rgba(255, 193, 7, 0.25))",
                        borderColor: "#FFD43B",
                      },
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          {selectedScript && (
            <EditScript
              script={selectedScript}
              show_edit_script={openEdit}
              close_edit_scripts={handle_close_script}
            />
          )}
        </Box>
      )}
    </Box>
  );
};
