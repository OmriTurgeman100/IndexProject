import {
  get_users_list,
  get_current_user,
  set_user_permission,
  delete_user,
  get_attached_entities,
  delete_user_entity,
  add_custom_entity_access,
  set_user_access_scope,
  set_user_is_script,
} from "../services/UsersData";
import { total_services_and_systems } from "../services/Get_Vis_Menu";
import {
  Typography,
  Box,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Add, Delete } from "@mui/icons-material";
import { useThemeContext } from "../hooks/useThemeContext";
import { Settings } from "@mui/icons-material";
import { DisplayUserLogs } from "../components/DisplayUserLogs";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CodeIcon from "@mui/icons-material/Code";
import { DisplayUserScripts } from "../components/DisplayUserScripts";
import TerminalIcon from "@mui/icons-material/Terminal";
import PersonIcon from "@mui/icons-material/Person";

interface user {
  id: number;
  username: string;
  role: string;
  access_scope: string;
  script_execution_scope: string;
  is_script: boolean;
}

interface attached_entities {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_name: string;
}

interface menu {
  name: string;
  id: number;
  type: string;
}

const ROLES = ["guest", "viewer", "editor", "admin"];

const Access_Scopes = ["total", "custom"];

export const Users = () => {
  const [users, setUsers] = useState<user[]>([]);
  const [currentUser, setCurrentUser] = useState<user[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshDelete, setRefreshDelete] = useState<boolean>(false);
  const [UserEntities, setUserEntities] = useState<attached_entities[]>([]);
  const [entitiesDialog, setEntitiesDialog] = useState<boolean>(false);
  const [menuDialog, setMenuDialog] = useState<boolean>(false);
  const [menu, setMenu] = useState<menu[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number>();
  const [showUserLogs, setShowUserLogs] = useState<boolean>(false);
  const [deleteUserDialog, setDeleteUserDialog] = useState<boolean>(false);
  const [deleteUserId, setDeleteUserId] = useState<number | undefined>();
  const [showUserScripts, setShowUserScripts] = useState<boolean>(false);
  const { theme } = useThemeContext();

  const fetch_users = async () => {
    try {
      const response = await get_users_list();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_user_attached_entities = async (user_id: number) => {
    try {
      const response = await get_attached_entities(user_id);

      setUserEntities(response.data);
    } catch (error) {
      console.error(error);
    }
  };

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

      setCurrentUser(response.data);

      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const update_user_role = async (id: number, role: string) => {
    try {
      await set_user_permission(id, role);

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, role } : user)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handle_delete_user = async (id: number) => {
    try {
      await delete_user(id);

      setDeleteUserDialog(false);

      setDeleteUserId(undefined);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const update_user_access_scope = async (id: number, access_scope: string) => {
    try {
      await set_user_access_scope(id, access_scope);

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, access_scope } : user)),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handle_delete_user_entity = async (id: number) => {
    try {
      await delete_user_entity(id);

      close_dialog();

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  function open_dialog(user_id: number): void {
    setSelectedUserId(user_id);
    fetch_user_attached_entities(user_id);
    fetch_services_and_systems();

    setEntitiesDialog(true);
  }

  function close_dialog(): void {
    setEntitiesDialog(false);
  }

  function open_menu_dialog(): void {
    close_dialog();
    setMenuDialog(true);
  }

  function close_menu_dialog(): void {
    setMenuDialog(false);
  }

  function close_delete_dialog(): void {
    setDeleteUserId(undefined);
    setDeleteUserDialog(false);
  }

  const handle_post_entitiy_access = async (
    entity_id: number,
    entity_type: string,
    user_id: number,
  ) => {
    try {
      await add_custom_entity_access(entity_id, entity_type, user_id);

      close_menu_dialog();

      open_dialog(user_id);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_open_user_logs(user_id: number | undefined): void {
    setSelectedUserId(user_id);
    setShowUserLogs(true);
  }

  function handle_close_user_logs(): void {
    setSelectedUserId(undefined);
    setShowUserLogs(false);
  }

  function handle_delete_user_dialog(user_id: number) {
    setDeleteUserId(user_id);
    setDeleteUserDialog(true);
  }

  function handle_open_user_scripts(user_id: number) {
    setSelectedUserId(user_id);

    setShowUserScripts(true);
  }

  const update_user_is_script = async (user_id: number, is_script: boolean) => {
    try {
      await set_user_is_script(user_id, is_script);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_users();
    fetch_current_user();
  }, [refreshDelete]);

  return (
    <>
      {loading === false ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            margin: 3,
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: "20px" }}>משתמש נוכחי</Typography>

          {currentUser.map((item) => (
            <Box
              key={item.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                borderRadius: 3,
                width: "500px",
                height: "50px",
                padding: "5px",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>{item.id}</Typography>

                <Typography>מזהה</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>{item.role}</Typography>

                <Typography>הרשאות</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {item.username}
                </Typography>

                <Typography>שם</Typography>
              </Box>
            </Box>
          ))}

          <Typography sx={{ fontSize: "20px", marginBottom: 1 }}>
            משתמשים
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
            }}
          >
            {users.map((item) => (
              <Box
                key={item.id}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography sx={{ fontSize: "18px" }}>
                  {item.username}
                </Typography>

                <Select
                  value={item.role}
                  onChange={(e) => update_user_role(item.id, e.target.value)}
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </Select>

                <Select
                  value={item.access_scope}
                  onChange={(e) =>
                    update_user_access_scope(item.id, e.target.value)
                  }
                >
                  {Access_Scopes.map((scope) => (
                    <MenuItem key={scope} value={scope}>
                      {scope}
                    </MenuItem>
                  ))}
                </Select>

                <IconButton onClick={() => open_dialog(item.id)}>
                  <Settings />
                </IconButton>

                <IconButton onClick={() => handle_delete_user_dialog(item.id)}>
                  <DeleteForeverIcon />
                </IconButton>

                <IconButton onClick={() => handle_open_user_logs(item.id)}>
                  <EventNoteIcon />
                </IconButton>

                <IconButton onClick={() => handle_open_user_scripts(item.id)}>
                  <CodeIcon />
                </IconButton>

                {item.is_script ? (
                  <IconButton
                    onClick={() => update_user_is_script(item.id, false)}
                  >
                    <TerminalIcon />
                  </IconButton>
                ) : (
                  <IconButton
                    onClick={() => update_user_is_script(item.id, true)}
                  >
                    <PersonIcon />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>

          <Dialog open={deleteUserDialog} onClose={close_delete_dialog}>
            <DialogTitle> ? האם אתה בטוח רוצה למחוק את משתמש זה</DialogTitle>

            <DialogContent>
              <DialogContentText sx={{ textAlign: "right" }}>
                .מחיקת המשתמש היא סופית ואינה ניתנת לביטול
              </DialogContentText>
            </DialogContent>

            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => handle_delete_user(deleteUserId as number)}
                sx={{ width: "50%", color: "red" }}
              >
                כן
              </Button>
              <Button
                onClick={close_delete_dialog}
                sx={{ width: "50%", color: "green" }}
              >
                לא
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={entitiesDialog} onClose={close_dialog}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                marginTop: "15px",
              }}
            >
              <IconButton
                sx={{ backgroundColor: theme.palette.primary.main }}
                onClick={() => open_menu_dialog()}
              >
                <Add />
              </IconButton>

              <Typography sx={{ fontSize: "18px" }}>רשימת הרשאות</Typography>
            </Box>

            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {UserEntities.map((item) => (
                <Box
                  key={item.entity_id}
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <Typography>{item.entity_name}</Typography>

                  <IconButton
                    onClick={() => handle_delete_user_entity(item.id)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </DialogContent>
          </Dialog>

          <Dialog open={menuDialog} onClose={close_menu_dialog}>
            <DialogTitle sx={{ textAlign: "right" }}>
              ניתן להוסיף הרשאות
            </DialogTitle>

            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {menu.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Typography>{item.name}</Typography>

                  <IconButton
                    sx={{ backgroundColor: theme.palette.primary.main }}
                    onClick={() =>
                      handle_post_entitiy_access(
                        item.id,
                        item.type,
                        selectedUserId as number,
                      )
                    }
                  >
                    <Add />
                  </IconButton>
                </Box>
              ))}
            </DialogContent>
          </Dialog>

          {selectedUserId && (
            <DisplayUserLogs
              user_id={selectedUserId}
              show_logs={showUserLogs}
              close_logs={handle_close_user_logs}
            />
          )}

          {selectedUserId && (
            <DisplayUserScripts
              user_id={selectedUserId}
              show_scripts={showUserScripts}
              close_scripts={() => setShowUserScripts(false)}
            />
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <CircularProgress sx={{ color: "#007FFF" }} />
        </Box>
      )}
    </>
  );
};
