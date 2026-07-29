import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { execute_system_script } from "../services/System";
import { execute_service_script } from "../services/Service";
import { useState } from "react";
import Divider from "@mui/material/Divider";
import { useThemeContext } from "../hooks/useThemeContext";
import PlayCircleFilledOutlinedIcon from "@mui/icons-material/PlayCircleFilledOutlined";
import { useEffect } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Alert from "@mui/material/Alert";
import CheckIcon from "@mui/icons-material/Check";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

interface script {
  title: string;
  id: number;
  type: string;
  description: string;
}

interface PropData {
  script: script;
  show_execute_script: boolean;
  close_execute_scripts: () => void;
}

export const ExecuteScript = ({
  script,
  show_execute_script,
  close_execute_scripts,
}: PropData) => {
  const [scriptOutput, setScriptOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const { isDarkMode } = useThemeContext();
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const handle_execute_script = async () => {
    try {
      setScriptOutput("");
      setExecutionTime(null);
      setLoading(true);

      const start = performance.now();

      let response;

      switch (script.type) {
        case "system":
          response = await execute_system_script(script.id);
          break;

        case "service":
          response = await execute_service_script(script.id);
          break;
      }

      const end = performance.now();
      const duration = ((end - start) / 1000).toFixed(2);

      setScriptOutput(response.data);
      setExecutionTime(Number(duration));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handle_copy_output = async () => {
    if (!scriptOutput) return;

    try {
      await navigator.clipboard.writeText(scriptOutput);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (!show_execute_script) {
      setScriptOutput("");
      setExecutionTime(null);
      setLoading(false);
    }
  }, [show_execute_script]);

  return (
    <Dialog
      open={show_execute_script}
      onClose={close_execute_scripts}
      maxWidth="lg"
      fullWidth
      fullScreen={isFullScreen}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px",
        }}
      >
        <DialogTitle sx={{ direction: "rtl" }}>{script.title}</DialogTitle>

        <Box>
          <IconButton
            onClick={() => setIsFullScreen((prev) => !prev)}
            sx={{
              transition: "transform 0.2s ease",
              "&:hover": {
                backgroundColor: "transparent",
                transform: "scale(1.1)",
              },
            }}
          >
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>

          <IconButton
            onClick={handle_copy_output}
            disabled={!scriptOutput}
            sx={{
              transition: "transform 0.2s ease",
              "&:hover": {
                backgroundColor: "transparent",
                transform: "scale(1.1)",
              },
            }}
          >
            <ContentCopyIcon
              sx={{
                color: scriptOutput ? "grey" : "primary.main",
              }}
            />
          </IconButton>

          <IconButton
            onClick={handle_execute_script}
            disabled={loading}
            sx={{
              transition: "transform 0.2s ease",
              "&:hover": {
                backgroundColor: "transparent",
                transform: "scale(1.15)",
              },
            }}
          >
            <PlayCircleFilledOutlinedIcon
              sx={{
                color: !loading ? "success.light" : "grey",
                fontSize: "40px",
                transition: "transform 0.2s ease",
              }}
            />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {scriptOutput && (
        <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
          Script executed successfully in {executionTime} seconds.
        </Alert>
      )}
      <Divider />

      <DialogContent sx={{ height: "500px" }}>
        {loading && (
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#2196f3",
              },
            }}
          />
        )}

        {scriptOutput && (
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              backgroundColor: isDarkMode ? "#1e1e1e" : "#f5f5f5",
              color: isDarkMode ? "#f5f5f5" : "#1e1e1e",
              padding: 2,
              borderRadius: 2,
              fontFamily: "Consolas, Monaco, monospace",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              boxShadow: isDarkMode
                ? "0 0 10px rgba(0,0,0,0.4)"
                : "0 2px 8px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              border: "1px solid",
              borderColor: isDarkMode ? "grey.800" : "grey.300",
            }}
          >
            <pre style={{ margin: 0 }}>{scriptOutput}</pre>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
