import { Typography, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { user_contributions } from "../services/Get_Visualization_Total";
import first_place from "../assets/first_place.svg";
import second_place from "../assets/second_place.svg";
import third_place from "../assets/third_place.svg";
// import data_files from "../assets/data_files.svg";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
// import Divider from "@mui/material/Divider";
import user_profile from "../assets/user_profile.svg";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { total_user_contributions } from "../services/Get_Visualization_Total";
import { useThemeContext } from "../hooks/useThemeContext";
import SquareIcon from "@mui/icons-material/Square";

interface contributions {
  username: string;
  contributions: number;
  top: number;
  mode: string;
}

interface TotalContributions {
  date: string;
  count: number;
  percentage: number;
}

export const Contributors = () => {
  const [Contributions, setContributions] = useState<contributions[]>([]);
  const [TotalContributions, setTotalContributions] = useState<
    TotalContributions[]
  >([]);
  const [range, setRange] = useState("1 year");
  const { isDarkMode } = useThemeContext();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const handleChange = (event: SelectChangeEvent) => {
    setRange(event.target.value as string);
  };

  const fetch_user_contributions = async () => {
    try {
      const response = await user_contributions(range);

      setContributions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetch_total_users_contributions = async () => {
    try {
      const response = await total_user_contributions();

      setTotalContributions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const year = new Date().getFullYear();

  const startDate = new Date(year, 0, 1); // Jan 1
  const endDate = new Date(year, 11, 31); // Dec 31

  useEffect(() => {
    fetch_user_contributions();
    fetch_total_users_contributions();
  }, [range]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 2,
        mt: "30px",
      }}
    >
      <Box sx={{ width: "1000px" }}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={endDate}
          values={TotalContributions}
          showWeekdayLabels={true}
          classForValue={(value) => {
            if (!value || value.percentage === 0) {
              return isDarkMode ? "color-empty-dark" : "color-empty-light";
            }

            if (value.percentage <= 25)
              return isDarkMode ? "color-scale-1-dark" : "color-scale-1-light";
            if (value.percentage <= 50)
              return isDarkMode ? "color-scale-2-dark" : "color-scale-2-light";
            if (value.percentage <= 75)
              return isDarkMode ? "color-scale-3-dark" : "color-scale-3-light";

            return isDarkMode ? "color-scale-4-dark" : "color-scale-4-light";
          }}
          onMouseOver={(event, value) => {
            const count = value?.count ?? 0;
            // const percentage = value?.percentage ?? 0;
            const contributionLabel =
              count === 1 ? "contribution" : "contributions";
            const date = value?.date?.split("T")[0];

            const text = date
              ? `${count} ${contributionLabel} on ${date}`
              : "No contribution data";

            setTooltip({
              x: event.clientX + 12,
              y: event.clientY + 12,
              text,
            });
          }}
          onMouseLeave={() => setTooltip(null)}
        />
      </Box>

      {tooltip && (
        <Box
          sx={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 1500,
            pointerEvents: "none",
            borderRadius: 1,
            bgcolor: isDarkMode ? "#f5f5f5" : "#24292f",
            color: isDarkMode ? "#24292f" : "#fff",
            px: 1.5,
            py: 0.75,
            fontSize: "0.8rem",
            boxShadow: 3,
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.text}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          position: "absolute",
          top: 260,
          right: 460,
        }}
      >
        <Typography>Less</Typography>

        {isDarkMode ? (
          <>
            <SquareIcon sx={{ color: "#161b22" }} />

            <SquareIcon sx={{ color: "#0e4429" }} />

            <SquareIcon sx={{ color: "#006d32" }} />

            <SquareIcon sx={{ color: "#26a641" }} />

            <SquareIcon sx={{ color: "#39d353" }} />
          </>
        ) : (
          <>
            <SquareIcon sx={{ color: "#ebedf0" }} />

            <SquareIcon sx={{ color: "#9be9a8" }} />

            <SquareIcon sx={{ color: "#40c463" }} />

            <SquareIcon sx={{ color: "#30a14e" }} />

            <SquareIcon sx={{ color: "#216e39" }} />
          </>
        )}

        <Typography>More</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "50%",
          position: "absolute",
          top: "280px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: "center",
          }}
        >
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="range-select-label">טווח</InputLabel>
              <Select
                sx={{ direction: "rtl" }}
                labelId="range-select-label"
                id="range-select"
                value={range}
                label="טווח"
                onChange={handleChange}
              >
                <MenuItem sx={{ direction: "rtl" }} value="24 hours">
                  24 שעות
                </MenuItem>
                <MenuItem sx={{ direction: "rtl" }} value="3 days">
                  3 ימים
                </MenuItem>
                <MenuItem sx={{ direction: "rtl" }} value="7 days">
                  7 ימים
                </MenuItem>
                <MenuItem sx={{ direction: "rtl" }} value="1 month">
                  חודש
                </MenuItem>
                <MenuItem sx={{ direction: "rtl" }} value="1 year">
                  שנה
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography>התורמים הכי גדולים למידע במשך </Typography>
        </Box>

        {Contributions.map((item) => (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {item.top == 1 ? (
                <img
                  style={{ height: "40px", width: "50px" }}
                  src={first_place}
                />
              ) : item.top == 2 ? (
                <img
                  style={{ height: "40px", width: "50px" }}
                  src={second_place}
                />
              ) : item.top == 3 ? (
                <img
                  style={{ height: "40px", width: "50px" }}
                  src={third_place}
                />
              ) : (
                <Box
                  sx={{
                    width: "50px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "22px", color: "#1C92E7" }}>
                    {item.top}
                  </Typography>
                </Box>
              )}

              <img
                src={user_profile}
                style={{ height: "50px", width: "50px" }}
              />

              <Typography sx={{ fontWeight: "bold" }}>
                {item.username}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>נקודות</Typography>

              <Typography>{item.contributions}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <GradientBlurLeft left_position="-100px" top_position="100px" />
      <GradientBlurRight right_position="-100px" top_position="150px" />
    </Box>
  );
};
