import { display_user_logs } from "../services/UsersData";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";

interface UserLogs {
  id: number;
  username: string;
  role: string;
  access_scope: string;
  action: string;
  route: string;
  status_code: number;
  created_at: string;
  body: string
}

interface PropData {
  user_id: number | undefined;
  show_logs: boolean;
  close_logs: () => void;
}

export const DisplayUserLogs = ({
  user_id,
  show_logs,
  close_logs,
}: PropData) => {
  const [userLogs, setUserLogs] = useState<UserLogs[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(true);

  const fetch_user_logs = async (user_id: number | undefined) => {
    try {
      const response = await display_user_logs(user_id, page, pageSize);
      setUserLogs(response.data);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_user_logs(user_id);
  }, [user_id, page, pageSize]);

  const formatDate = (value: string) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("he-IL");
  };

  // helper: return sx overrides for Chip
  const methodColor = (methodRaw: string) => {
    const method = (methodRaw || "").toUpperCase().trim();
    switch (method) {
      case "GET":
        return { bgcolor: "#9acd32", color: "#000", fontWeight: 700 }; // greenish
      case "POST":
        return { bgcolor: "#ffcc80", color: "#000", fontWeight: 700 }; // yellow/orange
      case "PUT":
        return { bgcolor: "#80deea", color: "#000", fontWeight: 700 }; // cyan/light blue
      case "PATCH":
        return { bgcolor: "#ce93d8", color: "#000", fontWeight: 700 }; // purple
      case "DELETE":
        return { bgcolor: "#ef9a9a", color: "#000", fontWeight: 700 }; // red
      default:
        return { bgcolor: "#e0e0e0", color: "#000", fontWeight: 700 }; // grey fallback
    }
  };

  const statusColor = (code: number) => {
    if (code === 304) return "success";
    if (code >= 200 && code < 300) return "success";
    if (code >= 300 && code < 400) return "info";
    if (code >= 400 && code < 500) return "warning";
    return "error";
  };

  return (
    <Dialog open={show_logs} onClose={close_logs} fullWidth maxWidth="xl">
      <DialogTitle sx={{ textAlign: "center" }}>לוגים של המשתמש</DialogTitle>

      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "flex-end",
          }}
        >
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="page-size-label">גודל עמוד</InputLabel>
            <Select
              labelId="page-size-label"
              label="גודל עמוד"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            aria-label="previous-page"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            <RemoveIcon />
          </IconButton>

          <IconButton
            aria-label="next-page"
            onClick={() => setPage((prev) => prev + 1)}
          >
            <AddIcon />
          </IconButton>

          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            עמוד נוכחי: {page}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading === false ? (
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      backgroundColor: (t) =>
                        t.palette.mode === "light"
                          ? "#f7f7f8"
                          : "rgba(255,255,255,0.04)",
                      fontWeight: 700,
                    },
                  }}
                >
                  <TableCell>שם משתמש</TableCell>
                  <TableCell>תפקיד</TableCell>
                  <TableCell>תחום גישה</TableCell>
                  <TableCell>פעולה</TableCell>
                  <TableCell>נתיב</TableCell>
                  <TableCell>מידע</TableCell>
                  <TableCell>קוד </TableCell>
                  <TableCell>תאריך</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {userLogs.map((item, idx) => (
                  <TableRow
                    key={item.id ?? `${item.username}-${idx}`}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: (t) =>
                          t.palette.mode === "light"
                            ? "rgba(0,0,0,0.015)"
                            : "rgba(255,255,255,0.02)",
                      },
                      transition: "background 0.2s ease",
                    }}
                  >
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>{item.access_scope}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={(item.action || "").toUpperCase()}
                        sx={methodColor(item.action)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          backgroundColor: (t) =>
                            t.palette.mode === "light"
                              ? "#eef3ff"
                              : "rgba(144,202,249,0.12)",
                        }}
                      >
                        {item.route.length > 100
                          ? `${item.route.slice(0, 100)}…`
                          : item.route}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 220 }}>
                      <Tooltip title={item.body || ""} arrow placement="top">
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            maxWidth: 220,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontFamily: "monospace",
                            fontSize: "0.75rem",
                          }}
                        >
                          {item.body || "-"}
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status_code}
                        color={statusColor(item.status_code) as any}
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.created_at)}</TableCell>
                  </TableRow>
                ))}

                {userLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        אין נתונים להצגה
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#2196f3",
              },
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
