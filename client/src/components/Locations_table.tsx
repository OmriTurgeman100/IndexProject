import { useThemeContext } from "../hooks/useThemeContext";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
import StarIcon from "@mui/icons-material/Star";
import Tooltip from '@mui/material/Tooltip';
import ActiveLocationHistory from "./ActiveLocationHistory";
import { useState } from "react";

interface Locations {
  id: number;
  name: string;
  active_location: string | null;
  secondary_site: string | null;
  third_site: string | null;
  backup_type: string | null;
  type: "system" | "service";
  preferred_site: string | null;
  info: string
}

interface PropsData {
  locations: Locations[];
}

export const Locations_table = ({ locations }: PropsData) => {
  const { theme, isDarkMode } = useThemeContext();

  const [entitiy_id, setEntitiy_id] = useState<number>()
  const [type, setType] = useState<string>()
  const [showHistory, setShowHistory] = useState<boolean>(false)
  // const

  const priorityOrder = ["מצודת דוד", "מעוף", "קריה"];

  const locations_data: any[] = Array.from(
    new Set(
      locations.flatMap((l) =>
        [l.active_location, l.secondary_site, l.third_site]
          .map((loc) => loc?.trim())
          .filter((loc) => loc && loc.toLowerCase() !== "unknown"),
      ),
    ),
  ).sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a as string);

    const bIndex = priorityOrder.indexOf(b as string);

    if (aIndex === -1 && bIndex === -1) return 0;

    if (aIndex !== -1 && bIndex === -1) return 1;

    if (aIndex === -1 && bIndex !== -1) return -1;

    return aIndex - bIndex;
  });

  const getRole = (item: Locations, location: string) => {
    if (item.active_location === location) return "אתר ראשי";
    if (item.secondary_site === location) return "אתר משני";
    if (item.third_site === location) return "אתר שלישי";
    return "";
  };

  const getCellBgColor = (item: Locations, location: string) => {
    const green = isDarkMode
      ? theme.palette.success.dark
      : theme.palette.success.light;

    const orange = isDarkMode
      ? theme.palette.warning.dark
      : theme.palette.warning.light;

    if (item.active_location === location) {
      return green;
    }

    if (item.secondary_site === location) {
      if (
        item.backup_type === "יש (A-A)" ||
        item.backup_type === "יש (A-A-A)"
      ) {
        return green;
      }

      return orange;
    }

    if (item.third_site === location) {
      if (item.backup_type === "יש (A-A-A)") {
        return green;
      }

      return orange;
    }

    return "transparent";
  };

  const isPreferredSite = (item: Locations, location: string) => {
    return item.preferred_site?.trim() === location;
  };

  function handle_display_active_location(entity_id: number, type: string) {
    setEntitiy_id(entity_id)
    setType(type)

    setShowHistory(true)

  }

  return (
    <Box sx={{ width: "70%" }}>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          borderRadius: 5,
        }}
      >
        <Table
          sx={{
            "& th": {
              fontWeight: 600,
              fontSize: "0.95rem",
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& td": {
              fontSize: "0.9rem",
              py: 1.5,
            },
            "& tbody tr:nth-of-type(odd)": {
              backgroundColor: theme.palette.action.hover,
            },
            "& tbody tr:hover": {
              backgroundColor: theme.palette.action.selected,
              transition: "background-color 0.2s ease",
            },
          }}
        >
          <TableHead>
            <TableRow>
              {locations_data.map((loc) => (
                <TableCell key={loc} align="center">
                  {loc}
                </TableCell>
              ))}
              <TableCell align="center">שם מערכת / שירות</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {locations.map((item) => (
              <TableRow key={`${item.type}-${item.id}`}>
                {locations_data.map((loc) => (
                  <TableCell
                    key={loc}
                    align="center"
                    sx={{
                      backgroundColor: getCellBgColor(item, loc),
                      fontWeight:
                        getCellBgColor(item, loc) !== "transparent" ? 600 : 400,
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      gap={0.5}
                    >
                      {isPreferredSite(item, loc) && (
                        <StarIcon
                          fontSize="small"
                          sx={{
                            color: "#FFD966",
                            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.75))",
                          }}
                        />
                      )}

                      {getRole(item, loc)}
                    </Box>
                  </TableCell>
                ))}

                {/* <TableCell align="center">{item.name?.trim() || ""}</TableCell> */}
                <Tooltip title={item.info} slotProps={{
                  tooltip: {
                    sx: {
                      direction: "rtl",
                      textAlign: "right",
                      fontSize: "1rem",
                      padding: "12px 16px",
                      maxWidth: 300,
                    },
                  },
                }}>
                  <TableCell onClick={() => handle_display_active_location(item.id, item.type)}
                    align="center"
                    sx={{
                      border:
                        item.active_location?.trim() !==
                          item.preferred_site?.trim()
                          ? "2px solid #d32f2f"
                          : "none",
                      fontWeight:
                        item.active_location?.trim() !==
                          item.preferred_site?.trim()
                          ? 600
                          : 400,
                      cursor: "pointer"
                    }}
                  >
                    {item.name?.trim() || ""}
                  </TableCell>
                </Tooltip>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>


      {
        entitiy_id && type && (
          <ActiveLocationHistory entity_id={entitiy_id} type={type} show_history={showHistory} close_history={() => setShowHistory(false)} />
        )
      }

    </Box>
  );
};
