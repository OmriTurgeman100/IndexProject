import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { get_network_diagram } from "../services/Get_Visualization_Total";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";

interface NetworkData {
  type: string;
  id: number;
  name: string;
  parent: null | number;
}

export const NetworkDiagram = () => {
  const [networkData, setNetworkData] = useState<NetworkData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();
  const { theme } = useThemeContext();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const navigate = useNavigate();
  const InitialWidth = 1800;
  const InitialHeight = 1000;

  const gradientColors: { [key: string]: [string, string] } = {
    system: ["#00c6ff", "#0072ff"],
    service: ["#89f7fe", "#66a6ff"],
  };

  const fetchNetwork = async () => {
    try {
      const response = await get_network_diagram(id);
      setNetworkData(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  useEffect(() => {
    if (!networkData.length || !svgRef.current) return;

    const nodes = networkData.map((d) => ({
      ...d,
      id: d.id.toString(),
    }));

    const links = networkData
      .filter((d) => d.parent !== null)
      .map((d) => ({
        source: d.parent!.toString(),
        target: d.id.toString(),
      }));

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    Object.entries(gradientColors).forEach(([key, [start, end]]) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${key}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", start);
      gradient.append("stop").attr("offset", "100%").attr("stop-color", end);
    });

    const centerForce = d3.forceCenter(InitialWidth / 2, InitialHeight / 2);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(200)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", centerForce)
      .force("collide", d3.forceCollide(60));

    simulation.alpha(1).restart();

    const g = svg.append("g");

    const link = g
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", theme.palette.divider)
      .attr("stroke-width", 2);

    const node = g
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", 24)
      .attr("fill", (d: any) => `url(#gradient-${d.type})`)
      .attr("stroke", theme.palette.background.paper)
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");

    node
      .append("text")
      .text((d: any) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", -30)
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("fill", theme.palette.text.primary)
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.1)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });
  }, [networkData, theme]);

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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 2,
          }}
        >
          <svg ref={svgRef} width={InitialWidth} height={InitialHeight} />
        </Box>
      )}

      <IconButton
        onClick={() => navigate(`/services/${id}`)}
        sx={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <SubdirectoryArrowRightIcon />
      </IconButton>
    </div>
  );
};
