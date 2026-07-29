import { useEffect, useState } from "react";
import { get_virtual_machine_usage } from "../services/Get_Vis_Virtual_Machine";
import { Typography } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
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

interface FilterData {
  filter: string;
  limit: number;
}

export const VirtualMachineChart = ({ filter, limit }: FilterData) => {
  const [data, setData] = useState<{ name: string; vm_count: number }[]>([]);
  const { theme } = useThemeContext();

  const fetchData = async () => {
    try {
      const response = await get_virtual_machine_usage(filter, limit);
      const formattedData = response.total_usage.map((item: any) => ({
        name: item.name,
        vm_count: parseInt(item.vm_count, 10),
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching VM usage data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const colors = ["#4F46E5", "#EC4899", "#FACC15", "#10B981"];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md">
      <Typography sx={{ textAlign: "center", }}>
        {filter === "systems" ? "מערכות" : "שירותים"} עם הכי הרבה מכונות וירטואליות
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fill: theme.palette.text.primary }} />
          <YAxis style={{ fill: theme.palette.text.primary }} />
          <Tooltip />
          <Bar dataKey="vm_count" radius={[6, 6, 0, 0]}>
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
