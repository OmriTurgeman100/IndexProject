import { NavLink, Outlet } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import CustomizedSwitches from "./ThemeSwitch";
import { useThemeContext } from "../hooks/useThemeContext";
import logo_light from "../assets/logo_light.svg";
import logo_dark from "../assets/logo_dark.svg";
import { useAuth } from "../hooks/useAuthContext";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { theme, isDarkMode } = useThemeContext();
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handle_logout(): void {
    logout();
    navigate("/login");
  }

  return (
    <div className="root-layout">
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          alignItems: "center",
          backgroundColor: theme.palette.primary.main,
          padding: "15px",
        }}
      >
        {isDarkMode ? (
          <img
            src={logo_dark}
            alt="Logo"
            style={{
              height: "40px",
              marginRight: "auto",
            }}
          />
        ) : (
          <img
            src={logo_light}
            alt="Logo"
            style={{
              height: "40px",
              marginRight: "auto",
            }}
          />
        )}

        <CustomizedSwitches />

        <NavLink to="/">דף הבית</NavLink>

        <NavLink to="/locations/aggregation">זמן אמת</NavLink>

        <NavLink to="/automations">פורטל</NavLink>

        <NavLink to="/docs">מסמכים</NavLink>

        <NavLink to="/architecture">ארכיטקטורה</NavLink>

        <NavLink to="/systems">מערכת</NavLink>

        <NavLink to="/services">שירות</NavLink>

        <NavLink to="/about">אודות</NavLink>

        <NavLink to="/developers">מידע למפתחים</NavLink>

        <NavLink to="/contributors">תורמים</NavLink>

        <NavLink to="/users">משתמשים</NavLink>

        <IconButton onClick={handle_logout}>
          <LogoutIcon />
        </IconButton>
      </Box>

      <main>
        <Outlet />
      </main>
    </div>
  );
};
