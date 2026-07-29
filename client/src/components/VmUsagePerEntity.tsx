import { useEffect, useState } from "react";
import { get_system_virtual_machines_usage } from "../services/System_vis";
import { get_service_virtual_machines_usage } from "../services/Service_vis";
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
  vm_count: number;
}

interface Props {
  id: any;
  type: string;
}

export const VirtualMachinesUsageBar = ({ id, type }: Props) => {
  const { theme } = useThemeContext();
  const [data, setData] = useState<BarChartData[]>([]);

  const fetch_data = async () => {
    try {
      if (type === "system") {
        const response = await get_system_virtual_machines_usage(id);

        setData(
          response.data.map(
            (item: { site_location: string; vm_count: string }) => ({
              site_location: item.site_location,
              vm_count: parseInt(item.vm_count),
            })
          )
        );
      } else if (type === "service") {
        const response = await get_service_virtual_machines_usage(id);

        setData(
          response.data.map(
            (item: { site_location: string; vm_count: string }) => ({
              site_location: item.site_location,
              vm_count: parseInt(item.vm_count),
            })
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_data();
  }, []);

  return (
    <div style={{ width: "100%", height: 300, marginTop: "20px" }}>
      <Typography sx={{ textAlign: "center" }}>
        מכונות וירטואליות לפי מיקום
      </Typography>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="site_location"
            style={{ fill: theme.palette.text.primary }}
          />
          <YAxis style={{ fill: theme.palette.text.primary }} />
          <Tooltip />
          <Bar
            dataKey="vm_count"
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
