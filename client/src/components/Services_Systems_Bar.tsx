import { useEffect, useState } from "react";
import { total_services_and_systems } from "../services/Get_Visualization_Total";
import { useThemeContext } from "../hooks/useThemeContext";
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

interface BarChart {
  name: String;
  value: number | null;
}

export const Services_Systems_Bar = () => {
  const { theme } = useThemeContext();
  const [data, setData] = useState<BarChart[]>([]);

  const fetch_data = async () => {
    try {
      const response = await total_services_and_systems();

      setData([
        { name: "Services", value: response.total_services },
        { name: "Systems", value: response.total_systems },
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
      <Typography sx={{ textAlign: "center"}}>
        כמות המערכות ושירותי ספיר הקיימים במערכת
      </Typography>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fill: theme.palette.text.primary }} />
          <YAxis style={{ fill: theme.palette.text.primary }} />
          <Tooltip />
          <Bar
            dataKey="value"
            fill="#8884d8"
            label={{
              position: "top",
              style: { fill: theme.palette.text.primary },
            }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index % 2 === 0 ? "#82ca9d" : "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
