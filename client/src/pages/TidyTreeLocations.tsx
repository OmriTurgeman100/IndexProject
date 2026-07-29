import { useState, useEffect, useRef } from "react";
import { tree_diagram_active_locations } from "../services/Get_Visualization_Total";
import {
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
} from "@mui/material";
import * as d3 from "d3";
import { useThemeContext } from "../hooks/useThemeContext";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { useNavigate } from "react-router-dom";

interface TreeData {
    id: number;
    name: string;
    parent: null | number;
    type: string;
}

export const TidyTreeLocations = () => {

    const [TreeData, setTreeData] = useState<TreeData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [dx, setDx] = useState<number>(22);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { theme } = useThemeContext();
    const [mode, setMode] = useState<string>("architecture");
    const navigate = useNavigate();

    const width = 1500;

    const gradientColors: { [key: string]: [string, string] } = {
        system: ["#00c6ff", "#0072ff"],
        service: ["#89f7fe", "#66a6ff"],
        location: ["#f7971e", "#ffd200"],
        root: ["#ff5f6d", "#ffc371"],
    };

    const fetch_data = async () => {
        try {

            const response = await tree_diagram_active_locations()

            setTreeData(response.data)

            setLoading(false)

        } catch (error) {
            console.error(error)
        }

    }

    function handle_redirect(): void {
        if (mode === "table") {
            navigate(`/locations/table`);
        } else if (mode === "aggregation") {
            navigate(`/locations/aggregation`);
        } else if (mode === "aggregation/table") {
            navigate("/locations/aggregation/table")
        }
    }

    const handleModeChange = (event: SelectChangeEvent): void => {
        setMode(event.target.value as string);
    };

    useEffect(() => {
        fetch_data();

        const interval = setInterval(() => {
            fetch_data();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        handle_redirect()
    }, [mode]);

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

    return (
        <Box sx={{
            minHeight: "100vh",
            position: "relative",
            overflow: "hidden",
            background:
                theme.palette.mode === "light"
                    ? `
            radial-gradient(circle at top left, rgba(0, 114, 255, 0.10), transparent 55%),
            radial-gradient(circle at bottom right, rgba(255, 193, 7, 0.10), transparent 55%),
            linear-gradient(to bottom, #f9fafb, #eef2f7)
          `
                    : `
            radial-gradient(circle at top left, rgba(0, 198, 255, 0.16), transparent 55%),
            radial-gradient(circle at bottom right, rgba(255, 95, 109, 0.16), transparent 55%),
            linear-gradient(to bottom, #020617, #020314)
          `,
        }}>
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
                                onChange={handleModeChange}
                            >
                                <MenuItem value={"aggregation/table"}>טבלה </MenuItem>
                                <MenuItem value={"aggregation"}>מחולק</MenuItem>
                                <MenuItem value={"table"}>בסיסי</MenuItem>
                                <MenuItem value={"architecture"}>ארכיטקטורה</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                </Box>
            )}
        </Box>
    )
}
