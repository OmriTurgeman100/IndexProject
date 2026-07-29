import { get_current_user } from "../services/UsersData";
import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import { get_current_user_scripts } from "../services/UsersData";
import user_profile from "../assets/user_profile.svg";
import Divider from "@mui/material/Divider";
import { DisplayProfileScripts } from "../components/DisplayProfileScripts";

interface user {
  id: number;
  username: string;
  role: string;
  access_scope: string;
  script_execution_scope: string;
}

interface menu {
  title: string;
  id: number;
  type: string;
  description: string;
  entity_name: string;
  entity_id: number;
  filename: string;
}

export const Profile = () => {
  const [currentUser, setCurrentUser] = useState<user>();
  const [menu, setMenu] = useState<menu[]>([]); // * holds scripts.
  const { theme } = useThemeContext();

  const fetch_current_user = async () => {
    try {
      const response = await get_current_user();

      setCurrentUser(response.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_current_user_scripts = async () => {
    try {
      const response = await get_current_user_scripts();

      setMenu(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_current_user();
    fetch_current_user_scripts();
  }, []);

  return (
    <Box sx={{ padding: "15px" }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          fontSize: "34px",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        My Profile
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
        View your profile, roles, permissions, and scripts.
      </Typography>

      <Box
        sx={{
          width: "95%",
          height: "200px",
          backgroundColor: theme.palette.background.paper,
          mt: "25px",
          borderRadius: "15px",
          padding: "20px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <img src={user_profile} style={{ height: 100, width: 100 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "25px",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {currentUser?.username}
            </Typography>

            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "success.light",
                animation: "pulse 1.8s infinite ease-in-out",
                "@keyframes pulse": {
                  "0%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                  "50%": {
                    transform: "scale(1.4)",
                    opacity: 0.6,
                  },
                  "100%": {
                    transform: "scale(1)",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          <Divider sx={{ width: "100%" }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Role</Typography>

              <Typography sx={{ color: "#8A55AD", fontWeight: "bold" }}>
                {currentUser?.role}
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Access level</Typography>
              <Typography sx={{ color: "#8A55AD", fontWeight: "bold" }}>
                {currentUser?.script_execution_scope}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <DisplayProfileScripts menu={menu}></DisplayProfileScripts>
    </Box>
  );
};
