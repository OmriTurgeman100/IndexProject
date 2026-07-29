import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useThemeContext } from "../hooks/useThemeContext";
import { get_system_auth_types } from "../services/System_vis";

interface AuthData {
  authentication_type: string | null;
  count: string;
}

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

export const System_Auth_Bar = () => {
  const [data, setData] = useState<AuthData[]>([]);
  const { theme } = useThemeContext();

  const fetchData = async () => {
    try {
      const response = await get_system_auth_types();
      const formatted = response.data
        .filter((item: AuthData) => item.authentication_type !== null)
        .map((item: AuthData) => ({
          authentication_type: item.authentication_type || "Unknown",
          count: parseInt(item.count, 10),
        }));
      setData(formatted);
    } catch (error) {
      console.error("Failed to fetch authentication data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <Typography sx={{ textAlign: "center" }}>
        כמות המערכות המשתמשות בכל סוג הזדהות
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="authentication_type"
            style={{ fill: theme.palette.text.primary }}
            angle={-14}
            textAnchor="middle"
            interval={0}
          />
          <YAxis style={{ fill: theme.palette.text.primary }} />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
