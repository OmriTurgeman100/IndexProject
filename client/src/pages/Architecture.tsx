import { useState, useEffect, useRef } from "react";
import { total_services_and_systems } from "../services/Get_Vis_Menu";
import { custom_services_systems } from "../services/Get_Visualization_Total";
import DoneIcon from "@mui/icons-material/Done";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { useThemeContext } from "../hooks/useThemeContext";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

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
  Box,
  TextField,
} from "@mui/material";

interface menu {
  name: string;
  id: number;
  type: string;
}

export const Architecture = () => {
  const [menu, setMenu] = useState<menu[]>([]);
  const [entities, setEntities] = useState<menu[]>([]);
  const [displayEntities, setDisplayEntities] = useState<boolean>(false);
  const [formData, setFormData] = useState<string>("");
  const { theme, isDarkMode } = useThemeContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await total_services_and_systems();

      setMenu(response.data);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
    }
  };

  const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(event.target.value);
  };

  const handle_submit = async (): Promise<void> => {
    try {
      const matchedRegex = menu.filter(({ name }) =>
        name.toLowerCase().startsWith(formData.toLowerCase())
      );

      if (matchedRegex.length > 1) {
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
          navigate(`/tidy/tree/${entity_id}/system`);
        } else if (entity_type === "service") {
          navigate(`/tidy/tree/${entity_id}/service`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  function handle_ref(): void {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  const redirect_to_system_or_services = (type: string, id: number): void => {
    switch (type) {
      case "service":
        navigate(`/tidy/tree/${id}/service`);
        break;
      case "system":
        navigate(`/tidy/tree/${id}/system`);
        break;
    }
  };

  useEffect(() => {
    fetchData();

    handle_ref();
  }, [isDarkMode, displayEntities]);

  return (
    <>
      {displayEntities === false ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountTreeIcon
                sx={{
                  color: "#0096FF",
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "50%",
                }}
              />
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              >
                חיפוש ארכיטקטורה של מערכת או שירות
              </Typography>
            </Box>
            <Typography sx={{ textAlign: "center", fontSize: "15px" }}>
              אנא ציין שם מערכת או שירות
            </Typography>
            <Box
              sx={{
                width: "fit-content",
                display: "flex",
                gap: "5px",
              }}
            >
              <TextField
                inputRef={inputRef}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && formData.length > 0) {
                    handle_submit();
                  }
                }}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  width: "500px",
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
                variant="outlined"
                value={formData}
                onChange={handle_change}
                placeholder="Search..."
              />

              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={handle_submit}
              >
                <DoneIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>
            </Box>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => setDisplayEntities(false)}
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
                              redirect_to_system_or_services(item.type, item.id)
                            }
                            sx={{ backgroundColor: theme.palette.primary.main }}
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
        </Box>
      )}
    </>
  );
};
