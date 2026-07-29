import { useEffect, useState } from "react";
import { get_virtual_machine_usage_per_site } from "../services/Get_Vis_Virtual_Machine_sites";
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

interface BarChartData {
  site_location: string;
  vm_count: string;
}

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
];

export const Virtual_Machine_Chart_Site = () => {
  const [data, setData] = useState<BarChartData[]>([]);
  const { theme } = useThemeContext();

  const fetchData = async () => {
    try {
      const response = await get_virtual_machine_usage_per_site();
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch virtual machine data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formattedData = data.map((item) => ({
    ...item,
    vm_count: parseInt(item.vm_count, 10),
  }));

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <Typography sx={{ textAlign: "center", mb: 2 }}>
        מספר מכונות וירטואליות לפי מיקום
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="site_location"
            style={{ fill: theme.palette.text.primary }}
            angle={-14}
            textAnchor="middle"
            interval={0}
          />
          <YAxis style={{ fill: theme.palette.text.primary }} />
          <Tooltip />
          <Bar dataKey="vm_count" radius={[6, 6, 0, 0]}>
            {formattedData.map((_, index) => (
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
