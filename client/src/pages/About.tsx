import { Typography, Paper, Box } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import { Services_Systems_Bar } from "../components/Services_Systems_Bar";
import { VirtualMachineChart } from "../components/Virtual_Machine_Chart";
import { useEffect, useState } from "react";
import { total_services_and_systems } from "../services/Get_Vis_Menu";
import { Virtual_Machine_Chart_Site } from "../components/Virtual_Machine_Chart_Site";
import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import IndexAboutlight from "../assets/IndexAboutLight.svg";
import IndexAboutDark from "../assets/IndexAboutDark.svg";

interface menu {
  name: string;
  id: number;
  type: string;
}

export const About = () => {
  const { theme, isDarkMode } = useThemeContext();
  const [menu, setMenu] = useState<menu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await total_services_and_systems();

      setMenu(response.data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
    }
  };

  const redirect_to_system_or_services = (type: string, id: number): void => {
    switch (type) {
      case "service":
        navigate(`/services/view/${id}`);
        break;
      case "system":
        navigate(`/systems/view/${id}`);
        break;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <div className="visualization_grid">
        <Paper
          // elevation={3}
          sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
        >
          <Services_Systems_Bar />
        </Paper>

        <Paper
          // elevation={3}
          sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
        >
          <VirtualMachineChart filter="systems" limit={3} />
        </Paper>

        <Paper
          // elevation={3}
          sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
        >
          <VirtualMachineChart filter="services" limit={3} />
        </Paper>

        <Paper
          // elevation={3}
          sx={{ padding: 3, backgroundColor: theme.palette.primary.main }}
        >
          <Virtual_Machine_Chart_Site />
        </Paper>
      </div>

      <Typography
        sx={{
          fontWeight: "bold",
          fontSize: "20px",
          textAlign: "center",
          margin: "15px",
        }}
      >
        IndexHive ברוך הבא ל
      </Typography>
      <Typography
        sx={{ fontSize: "17px", textAlign: "center", margin: "15px" }}
      >
        כאן תוכלו למצוא מידע על מערכות ושירותי מערך ספיר
      </Typography>
      <Paper
        sx={{
          backgroundColor: theme.palette.primary.main,
          height: "39vh",
          padding: "15px",
          overflow: "auto",
        }}
      >
        {loading === false ? (
          <Paper
            sx={{
              display: "flex",
              flexWrap: "wrap",
              backgroundColor: theme.palette.secondary.main,
              borderRadius: "5px",
              gap: "15px",
              padding: "20px",
            }}
          >
            {menu.map((item) => (
              <Paper
                key={item.name}
                sx={{
                  height: "fit-content",
                  width: "fit-content",
                  padding: "15px",
                  cursor: "pointer",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
                  },
                }}
                onClick={() => {
                  redirect_to_system_or_services(item.type, item.id);
                }}
              >
                <Typography>{item.name}</Typography>
              </Paper>
            ))}
          </Paper>
        ) : (
          <Paper
            sx={{
              display: "flex",
              flexWrap: "wrap",
              backgroundColor: theme.palette.secondary.main,
              borderRadius: "5px",
              gap: "15px",
              padding: "20px",
            }}
          >
            {[...Array(128)].map((_, index) => (
              <Skeleton key={index} variant="text" width={100} height={70} />
            ))}
          </Paper>
        )}
      </Paper>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "85px",
          marginTop: "15px",
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {isDarkMode ? (
            <img
              src={IndexAboutDark}
              alt="Logo"
              style={{
                height: "60px",
              }}
            />
          ) : (
            <img
              src={IndexAboutlight}
              alt="Logo"
              style={{
                height: "60px",
              }}
            />
          )}

          <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
            IndexHive
          </Typography>
        </Box>
      </Box>
    </div>
  );
};
