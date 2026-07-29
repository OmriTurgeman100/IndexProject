import { Box, Typography } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { ExecuteScript } from "./ExecuteScript";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

interface menu {
  title: string;
  id: number;
  type: string;
  description: string;
  filename: string;
  entity_name: string;
}

interface PropData {
  menu: menu[];
}

export const DisplayProfileScripts = ({ menu }: PropData) => {
  const { theme } = useThemeContext();
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
              Your Scripts
            </Typography>

            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.6,
                color: "#6B7280",
              }}
            >
              View and execute scripts that your account is authorized to use
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

        {filtered_scripts.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
                <TableRow>
                  <TableCell>
                    <strong>Title</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Filename</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Entity</strong>
                  </TableCell>

                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered_scripts.map((item) => (
                  <Tooltip
                    title={item.description}
                    key={`${item.type}-${item.title}-${item.id}`}
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
                    <TableRow sx={{ position: "relative" }}>
                      <TableCell sx={{ direction: "rtl" }}>
                        {item.title}
                      </TableCell>

                      <TableCell>{item.filename}</TableCell>

                      <TableCell>{item.entity_name}</TableCell>

                      <TableCell>{item.type}</TableCell>

                      <IconButton
                        disableRipple
                        sx={{
                          position: "absolute",
                          right: 15,
                          top: 5,
                          transition: "transform 0.2s ease",

                          "&:hover": {
                            backgroundColor: "transparent",
                            transform: "scale(1.15)",
                          },
                        }}
                        onClick={() => handle_open_show_script(item)}
                      >
                        <PlayCircleIcon sx={{ color: "success.light" }} />
                      </IconButton>
                    </TableRow>
                  </Tooltip>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box></Box>
        )}
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
