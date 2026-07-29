import { useParams, useNavigate } from "react-router-dom";
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
  CircularProgress,
  IconButton,
  Button,
  ButtonGroup,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { ToastContainer, Bounce } from "react-toastify";
import * as d3 from "d3";
import { useThemeContext } from "../hooks/useThemeContext";
import EastIcon from "@mui/icons-material/East";
import HomeIcon from "@mui/icons-material/Home";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridOffIcon from "@mui/icons-material/GridOff";

interface TreeData {
  id: number;
  name: string;
  parent: null | number;
  type: string;
}

export const IndentedTree = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [TreeData, setTreeData] = useState<TreeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [TreeNodeSize, setTreeNodeSize] = useState<number>(24);
  const [TreeWidthSize, setTreeWidthSize] = useState<number>(700);
  const [TextNodeSize, setTextNodeSize] = useState<number>(12);
  const [TextCountSize, setTextCountSize] = useState<number>(12);
  const [TreeCircleSize, setTreeCircleSize] = useState<number>(4);
  const [TotalTreeSize, setTotalTreeSize] = useState<number>(50);
  const [mode, setMode] = useState<string>("complete");
  const [level, setLevel] = useState<string>("simple");
  const [showBorder, setShowBoder] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  const nodeSize = TreeNodeSize;
  const width = TreeWidthSize;

  const style = `max-width: 100%; height: auto; font: 12px sans-serif; overflow: visible;${
    showBorder ? " border: 1px solid #ccc;" : ""
  }`;

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

  const increase_dimensions = (): void => {
    if (TreeNodeSize != 44 && TotalTreeSize != 100) {
      setTreeNodeSize((prev) => prev + 10);
      setTreeWidthSize((prev) => prev + 10);
      setTextNodeSize((prev) => prev + 5);
      setTextCountSize((prev) => prev + 5);
      setTreeCircleSize((prev) => prev + 1);
      setTotalTreeSize((prev) => prev + 25);
    }
  };

  const decrease_dimensions = (): void => {
    setTreeNodeSize((prev) => (prev > 24 ? prev - 10 : prev));
    setTreeWidthSize((prev) => (prev > 700 ? prev - 10 : prev));
    setTextNodeSize((prev) => (prev > 12 ? prev - 2 : prev));
    setTextCountSize((prev) => (prev > 12 ? prev - 2 : prev));
    setTreeCircleSize((prev) => (prev > 4 ? prev - 1 : prev));
    setTotalTreeSize((prev) => (prev > 50 ? prev - 25 : prev));
  };

  const handleChangeMode = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  const handleChangeLevel = (event: SelectChangeEvent): void => {
    setLevel(event.target.value);
  };

  useEffect(() => {
    fetch_data();
  }, [mode, level]);

  useEffect(() => {
    if (!TreeData.length || !svgRef.current) return;

    const format = d3.format(",");
    const stratify = d3
      .stratify<TreeData>()
      .id((d) => d.id.toString())
      .parentId((d) => (d.parent !== null ? d.parent.toString() : null));

    const root = stratify(TreeData).eachBefore(
      ((i) => (d: any) => {
        d.index = i++;
      })(0)
    );

    const nodes = root.descendants();
    const height = (nodes.length + 1) * nodeSize;

    const column = {
      label: "Count",
      value: (d: any) => (d.children ? 0 : 1),
      format: (value: any, d: any) => (d.children ? format(value) : "-"),
      x: width - 50,
    };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr(
        "viewBox",
        [-nodeSize / 2, (-nodeSize * 3) / 2, width, height].toString()
      )
      .attr("style", style);

    // Gradients
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

    // Links
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", theme.palette.divider)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", (d: any) => {
        return `M${d.source.depth * nodeSize},${d.source.index * nodeSize}
                V${d.target.index * nodeSize}
                h${nodeSize}`;
      });

    // Nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d: any) => `translate(0,${d.index * nodeSize})`);

    node
      .append("circle")
      .attr("cx", (d) => d.depth * nodeSize)
      .attr("r", TreeCircleSize)
      .attr("fill", (d) => {
        const gradId = `gradient-${d.data.type?.replace(/\s+/g, "-")}`;
        return d.children ? `url(#${gradId})` : theme.palette.text.secondary;
      });

    node
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", (d) => d.depth * nodeSize + 8)
      .text((d) => d.data.name)
      .attr("fill", theme.palette.text.primary)
      .attr("font-size", TextNodeSize);

    node.append("title").text((d) =>
      d
        .ancestors()
        .reverse()
        .map((d) => d.data.name)
        .join("/")
    );

    svg
      .append("text")
      .attr("dy", "0.32em")
      .attr("y", -nodeSize)
      .attr("x", column.x)
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .attr("fill", theme.palette.text.primary)
      .text(column.label);

    node
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", column.x)
      .attr("text-anchor", "end")
      .attr("fill", (d) => (d.children ? theme.palette.text.primary : "#555"))
      .attr("font-size", TextCountSize)
      .data(root.copy().sum(column.value).descendants())
      .text((d: any) => column.format(Math.max(d.value - 1, 0), d));
  }, [
    TreeData,
    theme,
    TreeNodeSize,
    TreeWidthSize,
    TextNodeSize,
    TextCountSize,
    TotalTreeSize,
    showBorder,
  ]);

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
              right: "10px",
              boxShadow: 3,
            }}
            variant="contained"
          >
            <Button onClick={increase_dimensions}>+</Button>
            <Button onClick={decrease_dimensions}>-</Button>
          </ButtonGroup>

          <IconButton
            onClick={() => navigate(`/tree/${id}/${type}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "110px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <ArrowUpwardIcon />
          </IconButton>

          <IconButton
            onClick={() => navigate(`/tidy/tree/${id}/${type}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "160px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <EastIcon />
          </IconButton>

          <IconButton
            onClick={() => navigate(`/${type}s/${id}`)}
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "210px",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            <HomeIcon />
          </IconButton>

          {showBorder === false ? (
            <IconButton
              onClick={() => setShowBoder((prev) => !prev)}
              sx={{
                position: "fixed",
                bottom: "15px",
                right: "260px",
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <GridOnIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => setShowBoder((prev) => !prev)}
              sx={{
                position: "fixed",
                bottom: "15px",
                right: "260px",
                backgroundColor: theme.palette.primary.main,
              }}
            >
              <GridOffIcon />
            </IconButton>
          )}

          <Box
            sx={{
              minWidth: 120,
              position: "fixed",
              bottom: "10px",
              right: "310px",
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
              bottom: "10px",
              right: "440px",
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

          <Box
            sx={{
              position: "fixed",
              bottom: "15px",
              right: "45%",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography> {`${TotalTreeSize}%`}</Typography>
            <Typography> גודל</Typography>
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
