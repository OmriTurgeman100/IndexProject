import {
  Typography,
  IconButton,
  Box,
  TextField,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { search_docs, docs_auto_suggestions } from "../services/Get_Visualization_Total";
import { useThemeContext } from "../hooks/useThemeContext";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";
import DoneIcon from "@mui/icons-material/Done";
import Chip from '@mui/material/Chip';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { DisplayDocs } from "../components/DisplayDocs";


interface entities {
  id: number
  title: string
  type: string
}

interface docs_suggestions {
  match: string
}

export const Docs = () => {
  const [entities, setEntities] = useState<entities[]>([]);
  const [formData, setFormData] = useState<string>("");
  const [showDocs, setShowDocs] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme, isDarkMode } = useThemeContext();
  const [docsAutoSuggestions, setDocsAutoSuggestions] = useState<docs_suggestions[]>([])

  const handle_submit = async () => {
    try {
      const response = await search_docs(formData)

      setEntities(response.data)

      setShowDocs(true)

    } catch (error) {
      console.error(error)
    }
  }

  const handle_change = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setFormData(event.target.value);

      if (event.target.value.length < 2) {
        setDocsAutoSuggestions([]);
        return;
      }

      const response = await docs_auto_suggestions(event.target.value);
      setDocsAutoSuggestions(response.data);

    } catch (error) {
      console.error(error)
    }
  };

  function handle_ref(): void {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  function close_docs(): void {
    setShowDocs(false)
  }

  useEffect(() => {
    handle_ref();
  }, [isDarkMode]);

  return (

    <div>

      {showDocs === false ? (
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "90vh",
          gap: 2
        }}>

          {/* <Chip label="חיפוש חכם" variant="outlined" icon={<AutoAwesomeIcon sx={{ color: '#1976d2' }} />} /> */}

          <Chip
            label="(regex) חיפוש חכם"
            icon={<AutoAwesomeIcon />}
            sx={{
              px: 1.5,
              height: 36,
              fontWeight: 600,
              fontSize: "0.85rem",

              color: "#2563EB",
              border: "1px solid rgba(79,108,247,0.35)",
              background:
                "linear-gradient(135deg, rgba(96,165,250,0.15), rgba(37,99,235,0.15))",

              "& .MuiChip-icon": {
                color: "#4F6CF7",
              },

              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(96,165,250,0.25), rgba(37,99,235,0.25))",
                borderColor: "#4F6CF7",
              },
            }}
          />

          <Typography
            sx={{
              fontSize: "2rem",
              fontWeight: 700,
              background: "linear-gradient(90deg, #60A5FA 0%, #2563EB 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
          >
            מצאו את מה שאתם צריכים ישירות
          </Typography>

          <Typography >ניתן לחפש לפי שם מסמך או תוכן מסמך</Typography>

          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "2px solid transparent",
                borderRadius: "50px",
                backgroundColor: theme.palette.background.paper,
                padding: "8px 16px",
                width: "fit-content",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                "&:focus-within": {
                  borderColor: "#4F6CF7",
                  boxShadow: "0 0 6px rgba(79,108,247,0.3)",
                },
              }}
            >
              <SearchIcon sx={{ color: "#4F6CF7", fontSize: 22 }} />

              <TextField
                inputRef={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.length > 0) {
                    handle_submit();
                  }
                }}
                placeholder="Search..."
                variant="outlined"
                sx={{
                  direction: "rtl",
                  width: "480px",
                  "& .MuiInputBase-input": {
                    padding: "8px 10px",
                    fontSize: "16px",
                    fontWeight: 400,
                    color: theme.palette.text.primary,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                }}
                value={formData}
                onChange={handle_change}
              />

              <IconButton
                onClick={handle_submit}
                sx={{
                  color: '#4F6CF7',
                  borderRadius: "50%",
                  padding: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <DoneIcon />
              </IconButton>
            </Box>

            {docsAutoSuggestions.length > 0 && (
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
                {docsAutoSuggestions.map((item, index) => (
                  <Box
                    key={index}
                    onClick={() => {
                      setFormData(item.match);
                      setDocsAutoSuggestions([]);
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
            )}

          </Box>

        </Box>

      ) :

        (
          <DisplayDocs entities={entities} keyword={formData} exit={close_docs}></DisplayDocs>
        )}

      <GradientBlurLeft left_position="-100px" top_position="120px" />

      <GradientBlurRight right_position="-100px" top_position="170px" />

    </div>

  )
}
