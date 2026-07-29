import { NavLink, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

export const AutomationsLayout = () => {
  const navItemStyles = {
    color: "#E6EAF2",
    borderRadius: 1,
    mb: 0.5,
    "&:hover": {
      backgroundColor: "#2A2F3A",
    },
    "&.active": {
      backgroundColor: "#3A3F4B",
      color: "#F2F4F8",
      "& .MuiListItemIcon-root": {
        color: "#F2F4F8",
      },
    },
  };

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
      <Box
        sx={{
          width: 240,
          borderRight: "1px solid rgba(0,0,0,0.12)",
          backgroundColor: "#0F1A2B",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <List>
          <ListItemButton component={NavLink} to="" end sx={navItemStyles}>
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <HomeOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>

          <ListItemButton component={NavLink} to="profile" sx={navItemStyles}>
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <AccountCircleOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>

          <ListItemButton component={NavLink} to="create" sx={navItemStyles}>
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <CreateOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Create" />
          </ListItemButton>


          <ListItemButton component={NavLink} to="manage" sx={navItemStyles}>
            <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
              <SettingsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Manage" />
          </ListItemButton>

        </List>
      </Box>

      <Box sx={{ flex: 1, p: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
