import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { total_services_and_systems } from "../services/Get_Vis_Menu";
import { useState, useEffect } from "react";
import { get_specific_script } from "../services/Get_Visualization_Total";
import { server_scripts_list } from "../services/Get_Visualization_Total";
import { edit_system_script } from "../services/System";
import { edit_service_script } from "../services/Service";
import { delete_service_script } from "../services/Service";
import { delete_system_script } from "../services/System";
import DeleteIcon from "@mui/icons-material/Delete";

interface script {
  title: string;
  id: number;
  type: string;
  description: string;
  entity_name: string;
  entity_id: number;
}

interface PropData {
  script: script;
  show_edit_script: boolean;
  close_edit_scripts: () => void;
}

interface menu {
  name: string;
  id: number;
  type: string;
}

export const EditScript = ({
  script,
  show_edit_script,
  close_edit_scripts,
}: PropData) => {
  const [menu, setMenu] = useState<menu[]>([]); // * systems and services
  const [editedScript, setEditedScript] = useState<script>(); // * script we fetched via props script id and type, fetched in order to have rerender.
  const [titleForm, setTitleForm] = useState<string>("");
  const [descriptionForm, setDescriptionForm] = useState<string>("");
  const [selectedScript, setSelectedScript] = useState<string>("");
  const [scriptsList, setScriptsList] = useState<string[]>();
  const [selectedEntity, setSelectedEntity] = useState<menu | null>(null); // * can be 1 system or service (menu item).
  const fetch_services_and_systems = async () => {
    try {
      const response = await total_services_and_systems();

      setMenu(response.data);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
    }
  };

  const filtered_menu = menu.filter((item) => item.type === script.type);

  const fetch_specific_script = async () => {
    try {
      const response = await get_specific_script(script.id, script.type);

      setEditedScript(response.data[0]);
      setTitleForm(response.data[0].title);
      setDescriptionForm(response.data[0].description);
      setSelectedScript(response.data[0].filename);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
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

  const fetch_server_scripts_list = async () => {
    try {
      const response = await server_scripts_list();

      setScriptsList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_edit_script = async () => {
    if (!selectedEntity) return;

    if (!editedScript) return;

    try {
      switch (editedScript?.type) {
        case "system":
          await edit_system_script(
            editedScript.id,
            selectedEntity?.id,
            titleForm,
            descriptionForm,
            selectedScript,
          );

          close_edit_scripts();
          break;
        case "service":
          await edit_service_script(
            editedScript.id,
            selectedEntity?.id,
            titleForm,
            descriptionForm,
            selectedScript,
          );

          close_edit_scripts();
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handle_delete_script = async (
    script_id: number,
    script_type: string,
  ) => {
    try {
      switch (script_type) {
        case "system":
          await delete_system_script(script_id);
          close_edit_scripts();
          break;
        case "service":
          await delete_service_script(script_id);
          close_edit_scripts();
          break;
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_server_scripts_list();
    fetch_services_and_systems();
    fetch_specific_script();
  }, [script]);

  useEffect(() => {
    if (!editedScript || !menu.length) return;

    const selected_parent_entity = menu.find(
      (item) =>
        item.type === editedScript.type && item.id === editedScript.entity_id,
    );

    setSelectedEntity(selected_parent_entity ?? null);
  }, [menu, editedScript]);

  return (
    <Dialog
      maxWidth="lg"
      fullWidth
      open={show_edit_script}
      onClose={close_edit_scripts}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <DialogTitle sx={{ direction: "rtl" }}>
          {editedScript?.title}
        </DialogTitle>

        <IconButton
          onClick={() => handle_delete_script(script.id, script.type)}
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      <Divider />

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
              {script.type}
            </Typography>

            <Autocomplete
              options={filtered_menu}
              getOptionLabel={(option) => option.name}
              value={selectedEntity}
              onChange={(_, newValue) => setSelectedEntity(newValue)}
              renderInput={(params) => (
                <TextField {...params} label={`Select ${script.type}`} />
              )}
            />
          </Box>

          <Button
            disabled={
              !selectedEntity ||
              !selectedScript ||
              !titleForm ||
              !descriptionForm
            }
            onClick={handle_edit_script}
            variant="outlined"
            sx={{
              width: "100%",
              borderRadius: 50,
              color: "#5E7FCC",
              textTransform: "none",
              borderColor: "#5E7FCC",
            }}
          >
            Edit Automation
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
