import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  tree_diagram,
  tree_diagram_stats,
  tree_diagram_custom,
  tree_diagram_advanced,
  tree_diagram_stats_advanced,
  tree_diagram_custom_advanced,
} from "../services/Get_Visualization_Total";
import { useThemeContext } from "../hooks/useThemeContext";
import { Box, Button, ButtonGroup } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { ToastContainer, Bounce } from "react-toastify";
// import { toast } from "react-toastify";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import * as d3 from "d3";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import EastIcon from "@mui/icons-material/East";
import ListIcon from "@mui/icons-material/List";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

interface TreeData {
  id: number;
  name: string;
  parent: null | number;
  type: string;
}

export const TreeDiagram = () => {
  const { id, type } = useParams();
  const [TreeData, setTreeData] = useState<TreeData[]>([]);
  const { theme } = useThemeContext();
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(800);
  const [InitialWidth, setInitialWidth] = useState<number>(1300);
  const [InitialHeight, setInitialHeight] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mode, setMode] = useState<string>("custom");
  const [level, setLevel] = useState<string>("simple");
  const navigate = useNavigate();

  const fetch_data = async () => {
    try {
      if (level === "simple") {
        if (mode === "complete") {
          const response = await tree_diagram(id, type);
          setTreeData(response.data);

          setLoading(false);

          // toast.success("Tree Fetched");
        } else if (mode === "stats") {
          const response = await tree_diagram_stats(id, type);
          setTreeData(response.data);

          setLoading(false);

          // toast.success("Tree Fetched");
        } else if (mode === "custom") {
          const response = await tree_diagram_custom(id, type);
          setTreeData(response.data);

          setLoading(false);

          // toast.success("Tree Fetched");
        }
      } else if (level === "full") {
        if (mode === "complete") {
          const response = await tree_diagram_advanced(id, type);
          setTreeData(response.data);

          setLoading(false);

          // toast.success("Tree Fetched");
        } else if (mode === "stats") {
          const response = await tree_diagram_stats_advanced(id, type);
          setTreeData(response.data);

          setLoading(false);

          // toast.success("Tree Fetched");
        } else if (mode === "custom") {
          const response = await tree_diagram_custom_advanced(id, type);
          setTreeData(response.data);

          setLoading(false);

          // toast.success("Tree Fetched");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const increase_dimensions = () => {
    setInitialWidth((prev) => prev + 200);
    setInitialHeight((prev) => prev + 200);
    setWidth((prev) => prev + 200);
    setHeight((prev) => prev + 200);
  };

  const decrease_dimensions = () => {
    setInitialWidth((prev) => prev - 200);
    setInitialHeight((prev) => prev - 200);
    setWidth((prev) => prev - 200);
    setHeight((prev) => prev - 200);
  };

  const handleChangeMode = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  const handleChangeLevel = (event: SelectChangeEvent): void => {
    setLevel(event.target.value as string);
  };

  const gradientColors: { [key: string]: [string, string] } = {
    system: ["#00c6ff", "#0072ff"],
    service: ["#89f7fe", "#66a6ff"],
    servers: ["#34e89e", "#0f3443"],
    dependency: ["#f7971e", "#ffd200"],
    auth: ["#00b4db", "#0083b0"],
    server: ["#fceabb", "#f8b500"],
    server_location: ["#43e97b", "#38f9d7"],
    server_type: ["#ff5f6d", "#ffc371"],
    server_network: ["#3CA55C", "#B5AC49"],
  };

  useEffect(() => {
    fetch_data();
  }, [mode, level]);

  useEffect(() => {
    if (!TreeData.length || !svgRef.current) return;

    const root = d3
      .stratify<TreeData>()
      .id((d) => d.id.toString())
      .parentId((d) => (d.parent !== null ? d.parent.toString() : null))(
      TreeData
    );

    const treeLayout = d3
      .tree<d3.HierarchyNode<TreeData>>()
      .size([width, height]);

    const treeData = treeLayout(d3.hierarchy(root));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    // Define gradients
    Object.entries(gradientColors).forEach(([key, [start, end]]) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${key.replace(/\s+/g, "-")}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", start);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", end);
    });

    const g = svg.append("g").attr("transform", "translate(100,100)");

    // Draw links
    g.selectAll(".link")
      .data(treeData.links())
      .enter()
      .append("line")
      .attr("stroke", theme.palette.divider)
      .attr("stroke-width", 2)
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    // Draw nodes
    const nodes = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    nodes
      .append("circle")
      .attr("r", 24)
      .attr("fill", (d) => {
        const gradId = `gradient-${d.data.data.type.replace(/\s+/g, "-")}`;
        return `url(#${gradId})`;
      })
      .attr("stroke", theme.palette.background.paper)
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

    nodes
      .append("text")
      .attr("dy", -30)
      .attr("text-anchor", "middle")
      .text((d) => d.data.data.name)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", theme.palette.text.primary)
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.1)");
  }, [TreeData, theme, width, height, level]);

  return (
    <div>
      {loading === true ? (
        <Box
          sx={{
            width: "100%",
            height: "90vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ color: "#007FFF" }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
          }}
        >
          <svg ref={svgRef} width={InitialWidth} height={InitialHeight} />

          <ButtonGroup
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "15px",
              boxShadow: 3,
            }}
            variant="contained"
          >
            <Button onClick={increase_dimensions}>+</Button>
            <Button onClick={decrease_dimensions}>-</Button>
          </ButtonGroup>

          <IconButton
            onClick={() => navigate(`/tidy/tree/${id}/${type}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "115px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <EastIcon />
          </IconButton>

          <IconButton
            onClick={() => navigate(`/indented/tree/${id}/${type}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "165px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <ListIcon />
          </IconButton>

          <IconButton
            onClick={() => navigate(`/${type}s/${id}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "215px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <HomeIcon />
          </IconButton>

          <Box
            sx={{
              minWidth: 120,
              position: "fixed",
              bottom: "10px",
              right: "275px",
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label"> סוג עץ</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={level}
                label="Level"
                onChange={handleChangeLevel}
              >
                <MenuItem value={"simple"}>פשוט</MenuItem>
                <MenuItem value={"full"}>מתקדם</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box
            sx={{
              minWidth: 120,
              position: "fixed",
              bottom: "15px",
              left: "15px",
            }}
          >
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">מצב מידע</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={mode}
                label="Mode"
                onChange={handleChangeMode}
              >
                <MenuItem value={"custom"}>משולב</MenuItem>
                <MenuItem value={"stats"}>מספרים</MenuItem>
                <MenuItem value={"complete"}>מלא</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <ToastContainer
            position="bottom-right"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            transition={Bounce}
          />
        </Box>
      )}
    </div>
  );
};
