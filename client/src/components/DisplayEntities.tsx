import { Box, Typography, Divider, TextField, IconButton } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import service_logo from "../assets/service_logo.svg";
import system_logo from "../assets/system_logo.svg";
import { useState, useEffect, useRef } from "react";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { export_entities_to_excel } from "../utils/export_data";

interface Entities {
  name: string;
  id: number;
  type: string;
}
interface Menu {
  field: string;
  translation: string;
}

interface PropData {
  entities: Entities[];
  redirect: (type: string, id: number) => void;
  filters: Record<string, string>;
  exit: () => void;
  menu: Menu[];
}

export const DisplayEntities = ({
  entities,
  redirect,
  filters,
  exit,
  menu,
}: PropData) => {
  const { theme, isDarkMode } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const entities_data = entities.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handle_ref(): void {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  // build a map once per render
  const menuMap: Record<string, string> = {};
  menu.forEach((m) => {
    menuMap[m.field] = m.translation;
  });

  // transform filters
  const translatedFilters = Object.entries(filters).map(([key, value]) => ({
    label: menuMap[key] ?? key,
    value,
    key,
  }));

  useEffect(() => {
    handle_ref();
  }, [isDarkMode]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "1000px",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          inputRef={inputRef}
          sx={{
            backgroundColor: theme.palette.background.paper,
            width: "500px",
            borderRadius: "35px",
            padding: "10px 15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
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
          value={searchQuery}
          onChange={handle_query_change}
          placeholder="Search..."
        />

        <IconButton
          onClick={exit}
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <CloseIcon />
        </IconButton>

        <IconButton
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => export_entities_to_excel(entities, translatedFilters)}
          sx={{
            backgroundColor: theme.palette.background.paper,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <FileDownloadIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          mt: 1.5,
          maxWidth: "1000px",
        }}
      >
        {translatedFilters.map((filter) => (
          <Box
            key={filter.key}
            sx={{
              backgroundColor: "hsl(217 91% 97%)",
              border: "1px solid hsl(217 91% 85%)",
              color: "hsl(217 91% 60%)",
              px: 0.75,
              py: 0.375,
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <Typography sx={{ fontSize: 12, color: "black" }}>
              {filter.value}
            </Typography>

            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
              :{filter.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          maxWidth: "1000px",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "flex-start",
          p: 2,
        }}
      >
        {entities_data.map((item) => (
          <Box
            onClick={() => redirect(item.type, item.id)}
            key={`${item.type}-${item.id}`}
            sx={{
              width: 280,
              p: 2,
              borderRadius: 3,
              bgcolor: isDarkMode
                ? theme.palette.background.paper
                : theme.palette.background.paper,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              overflow: "hidden",
              transition: "all 0.25s ease-in-out",
              "&:hover": {
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                transform: "translateY(-4px)",
                cursor: "pointer",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  borderRadius: 2,
                  bgcolor: isDarkMode
                    ? "rgba(100, 149, 237, 0.15)"
                    : "rgba(25, 118, 210, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={item.type === "service" ? service_logo : system_logo}
                  alt={item.type}
                  style={{ width: 28, height: 28 }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%", // make sure it respects the container
                  }}
                >
                  {item.name}
                </Typography>

                <Typography
                  sx={{
                    display: "inline-block",
                    px: 1.2,
                    py: 0.2,
                    mt: 0.5,
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "capitalize",
                    bgcolor: isDarkMode
                      ? item.type === "service"
                        ? "rgba(76, 175, 80, 0.25)"
                        : "rgba(33, 150, 243, 0.25)"
                      : item.type === "service"
                        ? "rgba(46, 125, 50, 0.12)"
                        : "rgba(25, 118, 210, 0.12)",
                    color: isDarkMode
                      ? item.type === "service"
                        ? "#81C784"
                        : "#64B5F6"
                      : item.type === "service"
                        ? "green"
                        : "blue",
                  }}
                >
                  {item.type}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 0.5,
              }}
            >
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                ID: {item.id}
              </Typography>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: "success.light",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
