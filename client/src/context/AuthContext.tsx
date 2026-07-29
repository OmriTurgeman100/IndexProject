import { createContext, useEffect, useState } from "react";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { setAccessToken } from "../lib/accessToken";
import { AuthUserLogout } from "../services/Logout";
import { AuthUserRefresh } from "../services/Refresh_token";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load_token = async () => {
      try {
        const response = await AuthUserRefresh();
      
        setAccessToken(response.token);
        setToken(response.token);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load_token();
  }, []);

  const login = (newToken: string) => {
    setAccessToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    setAccessToken(null);
    setToken(null);
    AuthUserLogout().catch(console.error);
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#007FFF" }} />
      </Box>
    );

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
