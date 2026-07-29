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
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { ToastContainer, Bounce } from "react-toastify";
// import { toast } from "react-toastify";
import * as d3 from "d3";
import { useThemeContext } from "../hooks/useThemeContext";
import IconButton from "@mui/material/IconButton";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ListIcon from "@mui/icons-material/List";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

interface TreeData {
  id: number;
  name: string;
  parent: null | number;
  type: string;
}

export const TidyTree = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [TreeData, setTreeData] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dx, setDx] = useState<number>(22);
  const [mode, setMode] = useState<string>("complete");
  const [level, setLevel] = useState<string>("simple");
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  const width = 1500;

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

  useEffect(() => {
    fetch_data();
  }, [mode, level]);

  useEffect(() => {
    if (!TreeData.length || !svgRef.current) return;

    const stratify = d3
      .stratify<TreeData>()
      .id((d) => d.id.toString())
      .parentId((d) => (d.parent !== null ? d.parent.toString() : null));

    const root = stratify(TreeData).sort((a, b) =>
      d3.ascending(a.data.name, b.data.name)
    );

    const dy = width / (root.height + 1);
    const treeLayout = d3.tree<TreeData>().nodeSize([dx, dy]);
    treeLayout(root);

    let x0 = Infinity;
    let x1 = -Infinity;
    (root as d3.HierarchyPointNode<TreeData>).each((d) => {
      if (d.x > x1) x1 = d.x;
      if (d.x < x0) x0 = d.x;
    });

    const height = x1 - x0 + dx * 2;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-dy / 3, x0 - dx, width, height].toString());

    const defs = svg.append("defs");

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

    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", theme.palette.divider)
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links() as d3.HierarchyPointLink<TreeData>[])
      .join("path")
      .attr(
        "d",
        d3
          .linkHorizontal<
            d3.HierarchyPointLink<TreeData>,
            d3.HierarchyPointNode<TreeData>
          >()
          .x((d) => d.y)
          .y((d) => d.x)
      );

    const node = svg
      .append("g")
      .attr("stroke-linejoin", "round")
      .attr("stroke-width", 3)
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    node
      .append("circle")
      .attr("fill", (d) => {
        const gradId = `gradient-${d.data.type.replace(/\s+/g, "-")}`;
        return `url(#${gradId})`;
      })
      .attr("r", 8)
      .attr("stroke", theme.palette.background.paper)
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

    node
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.children ? -10 : 10))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name)
      .attr("stroke", theme.palette.background.paper)
      .attr("paint-order", "stroke")
      .style("font-size", "12px")
      .style("fill", theme.palette.text.primary);
  }, [TreeData, dx, theme]);

  const handleModeChangeMode = (event: SelectChangeEvent): void => {
    setMode(event.target.value);
  };

  const handleChangeLevel = (event: SelectChangeEvent): void => {
    setLevel(event.target.value);
  };

  return (
    <div>
      {loading ? (
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
        <Box sx={{ margin: "10px", position: "relative" }}>
          <svg ref={svgRef} />

          <ButtonGroup
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "15px",
              boxShadow: 3,
            }}
            variant="contained"
          >
            <Button onClick={() => setDx((prev) => prev + 10)}>+</Button>
            <Button onClick={() => setDx((prev) => Math.max(prev - 10, 10))}>
              -
            </Button>
          </ButtonGroup>

          <IconButton
            onClick={() => navigate(`/tree/${id}/${type}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "115px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <ArrowUpwardIcon />
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
              <InputLabel id="mode-select-label">מצב מידע</InputLabel>
              <Select
                labelId="mode-select-label"
                value={mode}
                label="Mode"
                onChange={handleModeChangeMode}
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
