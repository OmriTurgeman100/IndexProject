import {
  Typography,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
} from "@mui/material";
import {
  get_specific_user,
  get_attached_scripts,
  set_user_scripts_scope,
  add_custom_script_access,
  delete_user_script,
} from "../services/UsersData";
import { scripts_menu } from "../services/Get_Visualization_Total";
import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { Add, Delete } from "@mui/icons-material";
import { useThemeContext } from "../hooks/useThemeContext";

interface user {
  id: number;
  username: string;
  role: string;
  access_scope: string;
  script_execution_scope: string;
}

interface PropData {
  user_id: number | undefined;
  show_scripts: boolean;
  close_scripts: () => void;
}

interface menu {
  title: string;
  id: number;
  type: string;
  description: string;
}

interface attached_scripts {
  id: number;
  title: string;
  type: number;
}

const Script_Scopes = ["total", "custom"];

export const DisplayUserScripts = ({
  user_id,
  show_scripts,
  close_scripts,
}: PropData) => {
  const [user, setUser] = useState<user>();
  const [UserScripts, setUserScripts] = useState<attached_scripts[]>([]);
  const [menuDialog, setMenuDialog] = useState<boolean>(false);
  const [menu, setMenu] = useState<menu[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { theme } = useThemeContext();

  const fetch_scripts_menu = async () => {
    try {
      const response = await scripts_menu();

      setMenu(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_user_info = async () => {
    try {
      const response = await get_specific_user(user_id!);

      setUser(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_user_attached_scripts = async () => {
    try {
      const response = await get_attached_scripts(user_id as number);

      setUserScripts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_user_scope = async (scope: string) => {
    try {
      await set_user_scripts_scope(user_id, scope);

      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_delete_user_script = async (id: number) => {
    try {
      await delete_user_script(id);

      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_post_script_access = async (
    script_id: number | string | undefined,
    script_type: string,
  ) => {
    try {
      await add_custom_script_access(script_id, script_type, user_id as number);

      setRefresh((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_user_info();
    fetch_user_attached_scripts();
    fetch_scripts_menu();
  }, [user_id, refresh]);

  return (
    <>
      <Dialog open={show_scripts} onClose={close_scripts}>
        <DialogTitle
          sx={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <IconButton
            sx={{ backgroundColor: theme.palette.primary.main }}
            onClick={() => setMenuDialog(true)}
          >
            <Add />
          </IconButton>
          {user?.username} הרשאות הרצת קוד
        </DialogTitle>

        <DialogContent>
          <Select
            sx={{ width: "100%" }}
            value={user?.script_execution_scope || ""}
            onChange={(e) => handle_user_scope(e.target.value)}
          >
            {Script_Scopes.map((scope) => (
              <MenuItem key={scope} value={scope}>
                {scope}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {UserScripts.map((item) => (
            <Box key={item.id} sx={{ display: "flex", alignItems: "center" }}>
              <Typography>{item.title}</Typography>

              <IconButton onClick={() => handle_delete_user_script(item.id)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog} onClose={() => setMenuDialog(false)}>
        <DialogTitle>ניתן להוסיף הרשאות</DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          {menu.map((item) => (
            <Box
              key={item.id}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Tooltip
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
                <Typography>{item.title}</Typography>
              </Tooltip>

              <IconButton
                sx={{ backgroundColor: theme.palette.primary.main }}
                onClick={() => handle_post_script_access(item.id, item.type)}
              >
                <Add />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};
