import { Box, Typography } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import code from "../assets/code.svg";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { ExecuteScript } from "./ExecuteScript";

interface menu {
  title: string;
  id: number;
  type: string;
  description: string;
}

interface PropData {
  menu: menu[];
}

export const DisplayScripts = ({ menu }: PropData) => {
  const { theme, isDarkMode } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showExecuteScript, setShowExecuteScript] = useState<boolean>(false);
  const [selectedScript, setSelectedScript] = useState<menu>();

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filtered_scripts = menu.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function handle_open_show_script(script: menu) {
    setSelectedScript(script);
    setShowExecuteScript(true);
  }

  return (
    <Box sx={{ mt: "25px" }}>
      <Box
        sx={{
          width: "95%",
          height: "fit-content",
          backgroundColor: theme.palette.background.paper,
          borderRadius: "15px",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              Remote script execution
            </Typography>

            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.6,
                color: "#6B7280",
              }}
            >
              Search scripts using title or description and execute them
              remotely
            </Typography>
          </Box>

          <TextField
            autoFocus
            variant="outlined"
            value={searchQuery}
            onChange={handle_query_change}
            placeholder="Search by title or description..."
            sx={{
              width: "20%",
              "& .MuiOutlinedInput-root": {
                borderRadius: "999px",
                backgroundColor: theme.palette.info.main,
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
        </Box>

        <Divider />

        <Box
          sx={{
            display: "flex",
            maxWidth: "100%",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "flex-start",
            p: 2,
          }}
        >
          {filtered_scripts.map((item) => (
            <Tooltip
              key={`${item.type}-${item.title}-${item.id}`}
              title={item.description}
              slotProps={{
                tooltip: {
                  sx: {
                    direction: "rtl",
                    fontSize: "1rem",
                    padding: "12px 16px",
                    lineHeight: 1.6,
                  },
                },
              }}
            >
              <Box
                onClick={() => handle_open_show_script(item)}
                sx={{
                  width: "280px",
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
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Box>

      {selectedScript && (
        <ExecuteScript
          script={selectedScript}
          show_execute_script={showExecuteScript}
          close_execute_scripts={() => setShowExecuteScript(false)}
        />
      )}
    </Box>
  );
};
