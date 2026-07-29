import { server_scripts_list } from "../services/Get_Visualization_Total";
import { get_current_user } from "../services/UsersData";
import { create_system_script } from "../services/System";
import { create_service_script } from "../services/Service";
import { total_services_and_systems } from "../services/Get_Vis_Menu";
import { useState, useEffect } from "react";
import { Box, Typography, TextField, Autocomplete } from "@mui/material";
import Alert from "@mui/material/Alert";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

interface user {
  id: number;
  username: string;
  role: string;
  access_scope: string;
  script_execution_scope: string;
}

interface menu {
  name: string;
  id: number;
  type: string;
}

export const CreateAutomation = () => {
  const [menu, setMenu] = useState<menu[]>([]); // * systems and services
  const [selectedEntity, setSelectedEntity] = useState<menu | null>(null); // * can be 1 system or service (menu item).
  const [currentUser, setCurrentUser] = useState<user>();
  const [scriptsList, setScriptsList] = useState<string[]>();
  const [titleForm, setTitleForm] = useState<string>("");
  const [descriptionForm, setDescriptionForm] = useState<string>("");
  const [selectedScript, setSelectedScript] = useState<string>("");
  const navigate = useNavigate();

  const fetch_services_and_systems = async () => {
    try {
      const response = await total_services_and_systems();

      setMenu(response.data);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
    }
  };

  const fetch_current_user = async () => {
    try {
      const response = await get_current_user();

      setCurrentUser(response.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_server_scripts_list = async () => {
    try {
      const response = await server_scripts_list();

      setScriptsList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_title = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitleForm(event.target.value);
  };

  const handle_description = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionForm(event.target.value);
  };

  const handle_change_selected_script = (event: SelectChangeEvent) => {
    setSelectedScript(event.target.value as string);
  };

  const handle_create_script = async () => {
    try {
      switch (selectedEntity?.type) {
        case "system":
          await create_system_script(
            selectedEntity.id,
            selectedScript,
            titleForm,
            descriptionForm,
          );

          navigate("/automations");

          break;
        case "service":
          await create_service_script(
            selectedEntity.id,
            selectedScript,
            titleForm,
            descriptionForm,
          );

          navigate("/automations");

          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_services_and_systems();
    fetch_current_user();
    fetch_server_scripts_list();
  }, []);

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
            Create New Script
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
            Create scripts, select files from the server, and assign them to
            systems or services.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              mt: "25px",
              width: "1000px",
              height: "700px",
              gap: 4,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "18px",
                }}
              >
                Title
              </Typography>

              <TextField
                sx={{ direction: "rtl", width: "100%" }}
                id="outlined-basic"
                label="title"
                variant="outlined"
                value={titleForm}
                onChange={handle_title}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "18px",
                }}
              >
                description
              </Typography>

              <TextField
                sx={{ direction: "rtl", width: "100%" }}
                multiline
                minRows={4}
                maxRows={10}
                id="outlined-basic"
                label="description"
                variant="outlined"
                value={descriptionForm}
                onChange={handle_description}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "18px",
                }}
              >
                script
              </Typography>

              <Box sx={{ minWidth: 120 }}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Script</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={selectedScript}
                    label="Script"
                    onChange={handle_change_selected_script}
                  >
                    {scriptsList?.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: "18px",
                }}
              >
                system or service
              </Typography>

              <Autocomplete
                options={menu}
                getOptionLabel={(option) => option.name}
                value={selectedEntity}
                onChange={(_, newValue) => setSelectedEntity(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select system or service" />
                )}
              />
            </Box>

            <Button
              onClick={handle_create_script}
              variant="outlined"
              sx={{
                width: "100%",
                borderRadius: 50,
                color: "#5E7FCC",
                textTransform: "none",
                borderColor: "#5E7FCC",
              }}
            >
              Create Automation
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
