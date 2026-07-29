import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  get_specific_service,
  get_service_virtual_machines,
  get_service_dependencies,
  get_service_dep_info,
  get_service_links,
  display_service_docs,
} from "../services/Service";
import { useThemeContext } from "../hooks/useThemeContext";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import service_logo from "../assets/service_logo.svg";
import BackupIcon from "@mui/icons-material/Backup"; // For backup_type (backup process/type)
import AccountTreeIcon from "@mui/icons-material/AccountTree"; // architecture
import CloudIcon from "@mui/icons-material/Cloud"; // env
import SecurityIcon from "@mui/icons-material/Security"; // cert infrastructure
import PlaceIcon from "@mui/icons-material/Place"; // For active_location (active site/location)
import HomeWorkIcon from "@mui/icons-material/HomeWork"; // For secondary_site (secondary facility)
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage"; // third location
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import ExpandIcon from "@mui/icons-material/Expand";
import DialogContentText from "@mui/material/DialogContentText";
import PublicIcon from "@mui/icons-material/Public";
import StorageIcon from "@mui/icons-material/Storage";
import WifiIcon from "@mui/icons-material/Wifi";
import LinkIcon from "@mui/icons-material/Link";
import LocationCityTwoToneIcon from "@mui/icons-material/LocationCityTwoTone";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
// import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import HubIcon from "@mui/icons-material/Hub";
import Link from "@mui/material/Link";
import ArticleIcon from "@mui/icons-material/Article";
import { ViewServiceFiles } from "../components/ViewServiceFiles";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import StarIcon from "@mui/icons-material/Star";

interface ServiceInfo {
  service_id: string;
  service_name: string;
  impact: string;
  owned_by: string;
  core_network: string;
  masad: string;
  secondary_site: string;
  backup_type: string;
  active_location: string;
  info: string;
  third_site: string;
  environment: string;
  cert_infrastructure: string;
  preferred_site: string;
}

interface VMInterface {
  id: number;
  service_parent: number;
  title: string;
  site_location: string;
  network: string;
  type: string;
  cluster: string;
  host: string;
  ip: string;
  room: string;
  rack: string;
}

interface DependencyInterface {
  id: number;
  service_parent: number;
  dependency: string;
}

interface DepInfoService {
  id: number;
  service_parent: number;
  service_dep_parent: number;
  description: string;
}

interface service_links {
  id: number;
  system_parent: number;
  title: string;
  link: string;
}

interface service_docs {
  id: number;
  system_id: number;
  title: number;
}

export const ViewService = () => {
  const { id } = useParams();
  const [data, setData] = useState<ServiceInfo[]>([]);
  const [vmList, setVMList] = useState<VMInterface[]>([]);
  const [depList, setDepList] = useState<DependencyInterface[]>([]);
  const [depInfoData, setInfoData] = useState<DepInfoService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [depInfoDialog, setDepInfoDialog] = useState(false);
  const [vmlistDialog, setVmlistDialog] = useState(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { theme, isDarkMode } = useThemeContext();
  const [viewMode, setViewMode] = useState<string>("new");
  const [serviceLinks, setServiceLinks] = useState<service_links[]>([]);
  const [showLinks, setShowLinks] = useState<boolean>(false);
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [docsList, setDocsList] = useState<service_docs[]>([]);
  const [showFiles, setShowFiles] = useState<boolean>(false);

  const fetch_data = async () => {
    try {
      const response = await get_specific_service(id);
      setData(response.data);

      const virtual_machines = await get_service_virtual_machines(id);

      setVMList(virtual_machines.data);

      const dep = await get_service_dependencies(id);

      setDepList(dep.data);

      const service_links = await get_service_links(id);

      setServiceLinks(service_links.data);

      const service_docs = await display_service_docs(id);

      setDocsList(service_docs.data);

      setLoading(false);
    } catch (error: any) {
      console.error(error);

      if (error.response.status === 403) {
        navigate("/forbidden");
      }
    }
  };

  const handleCloseDepInfo = (): void => {
    setDepInfoDialog(false);
  };

  const handleOpenVmlist = (): void => {
    setVmlistDialog(true);
  };

  const handleCloseVmlist = (): void => {
    setVmlistDialog(false);
  };

  const handle_query_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filtered_entities = vmList.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const get_dep_info_data = async (id: number) => {
    try {
      const response = await get_service_dep_info(id);

      setInfoData(response.data);

      setDepInfoDialog(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewModeChange = (event: SelectChangeEvent): void => {
    setViewMode(event.target.value as string);
  };

  function handle_redirect(): void {
    if (viewMode === "old") {
      navigate(`/services/${id}`);
    }
  }

  const hasDeploymentSites = data.some((item) =>
    [item.active_location, item.secondary_site, item.third_site].some(
      (v) => typeof v === "string" && v.trim() !== "",
    ),
  );

  useEffect(() => {
    fetch_data();

    handle_redirect();
  }, [viewMode]);
  return (
    <>
      {loading === false ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "15px",
            gap: 1,
          }}
        >
          {data.map((item) => (
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                width: "100%",
                maxWidth: "1000px",
                minHeight: "160px",
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                gap: 2,
                borderRadius: 4,
                border: "1px solid rgba(0, 0, 0, 0.05)",
                boxShadow:
                  "0 2px 6px rgba(0,0,0,0.05), 0 8px 20px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.12)",
                  transform: "translateY(-6px) scale(1.01)",
                },
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Impact Badge */}
                <Box
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: "30px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    bgcolor:
                      item.impact === "גבוהה"
                        ? "#fdecea"
                        : item.impact === "בינונית"
                          ? "#fff4e5"
                          : item.impact === "נמוכה"
                            ? "#e6f4ea"
                            : theme.palette.info.main,
                    color:
                      item.impact === "גבוהה"
                        ? "#d32f2f"
                        : item.impact === "בינונית"
                          ? "#ed6c02"
                          : item.impact === "נמוכה"
                            ? "#2e7d32"
                            : "text.primary",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  השפעה {item.impact}
                </Box>

                {/* System Info + Logo */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      alignItems: "flex-end", // <- right-align both lines
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                      {item.service_name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexDirection: "row-reverse",
                      }}
                    >
                      <GroupOutlinedIcon
                        sx={{ fontSize: 18, color: "text.secondary" }}
                      />
                      <Typography
                        sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                      >
                        {item.owned_by} צוות מטפל
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      bgcolor: isDarkMode
                        ? "rgba(100, 149, 237, 0.15)"
                        : "rgba(25, 118, 210, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img src={service_logo} style={{ width: 32, height: 32 }} />
                  </Box>
                </Box>
              </Box>

              {/* Info Section */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px",
                  borderRadius: 3,
                  gap: 1,
                  backgroundColor: isDarkMode
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "flex-end",
                  }}
                >
                  <Typography sx={{ direction: "rtl", fontWeight: "600" }}>
                    מידע על השירות
                  </Typography>
                  <DescriptionOutlinedIcon
                    sx={{ fontSize: 20, color: "text.secondary" }}
                  />
                </Box>

                <Typography
                  sx={{
                    direction: "rtl",
                    color: "text.primary",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    textAlign: "right",
                  }}
                >
                  {item.info}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Box
                  onClick={() => setShowDocs(true)}
                  sx={{
                    backgroundColor: "hsl(10, 100%, 96%)",
                    border: "1px solid hsl(10, 80%, 70%)",
                    color: "hsl(10, 70%, 35%)",
                    width: "fit-content",
                    px: 0.75,
                    py: 0.375,
                    borderRadius: "9999px",
                    alignItems: "center",
                    gap: 0.75,
                    display: "flex",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "hsl(10, 100%, 93%)",
                      border: "1px solid hsl(10, 80%, 55%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "black" }}>
                    מסמכים
                  </Typography>
                  <ArticleIcon
                    sx={{ fontSize: 14, color: "hsl(10, 70%, 35%)" }}
                  />
                </Box>

                <Box
                  onClick={() => setShowFiles(true)}
                  sx={{
                    backgroundColor: "hsl(185, 100%, 95%)",
                    border: "1px solid hsl(185, 70%, 65%)",
                    color: "hsl(185, 60%, 30%)",
                    width: "fit-content",
                    px: 0.75,
                    py: 0.375,
                    borderRadius: "9999px",
                    alignItems: "center",
                    gap: 0.75,
                    display: "flex",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "hsl(185, 100%, 92%)",
                      border: "1px solid hsl(185, 70%, 50%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "black" }}>
                    קבצים
                  </Typography>
                  <InsertDriveFileIcon
                    sx={{ fontSize: 14, color: "hsl(185, 60%, 30%)" }}
                  />
                </Box>

                <Box
                  onClick={() => setShowLinks(true)}
                  sx={{
                    backgroundColor: "hsl(270, 100%, 97%)",
                    border: "1px solid hsl(270, 70%, 70%)",
                    color: "hsl(270, 60%, 30%)",
                    width: "fit-content",
                    px: 0.75,
                    py: 0.375,
                    borderRadius: "9999px",
                    alignItems: "center",
                    gap: 0.75,
                    display: "flex",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "hsl(270, 100%, 94%)",
                      border: "1px solid hsl(270, 70%, 55%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "black" }}>
                    קישורים
                  </Typography>
                  <LinkIcon
                    sx={{ fontSize: 14, color: "hsl(270, 60%, 30%)" }}
                  />
                </Box>

                <Box
                  onClick={handleOpenVmlist}
                  sx={{
                    backgroundColor: "hsl(45, 100%, 95%)",
                    border: "1px solid hsl(45, 90%, 75%)",
                    color: "hsl(40, 90%, 35%)",
                    width: "fit-content",
                    px: 0.75,
                    py: 0.375,
                    borderRadius: "9999px",
                    alignItems: "center",
                    gap: 0.75,
                    display: "flex",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "hsl(45, 100%, 92%)",
                      border: "1px solid hsl(45, 90%, 60%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "black" }}>
                    שרתים
                  </Typography>
                  <StorageIcon
                    sx={{ fontSize: 14, color: "hsl(40, 90%, 35%)" }}
                  />
                </Box>

                <Box
                  onClick={() => navigate(`/network/${id}`)}
                  sx={{
                    backgroundColor: "hsl(145, 70%, 95%)",
                    border: "1px solid hsl(145, 60%, 75%)",
                    color: "hsl(145, 60%, 35%)",
                    width: "fit-content",
                    px: 0.75,
                    py: 0.375,
                    borderRadius: "9999px",
                    alignItems: "center",
                    gap: 0.75,
                    display: "flex",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "hsl(145, 70%, 92%)",
                      border: "1px solid hsl(145, 55%, 60%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "black" }}>
                    קישוריות
                  </Typography>
                  <HubIcon sx={{ fontSize: 14, color: "hsl(145, 60%, 35%)" }} />
                </Box>

                <Box
                  onClick={() => navigate(`/tree/${id}/service`)}
                  sx={{
                    backgroundColor: "hsl(220, 100%, 97%)",
                    border: "1px solid hsl(220, 90%, 80%)",
                    color: "hsl(220, 80%, 45%)",
                    width: "fit-content",
                    px: 0.75,
                    py: 0.375,
                    borderRadius: "9999px",
                    alignItems: "center",
                    gap: 0.75,
                    display: "flex",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "hsl(220, 100%, 94%)",
                      border: "1px solid hsl(220, 80%, 65%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "black" }}>
                    ארכיטקטורה
                  </Typography>
                  <AccountTreeIcon
                    sx={{ fontSize: 14, color: "hsl(220, 80%, 45%)" }}
                  />
                </Box>
              </Box>
            </Box>
          ))}

          {data.map((item) => (
            <Box
              sx={{
                width: "1000px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                padding: "10px",
                gap: 2,
              }}
            >
              {item.environment && item.environment.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>סביבה</Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.environment}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <CloudIcon />
                  </Avatar>
                </Box>
              ) : null}

              {item.core_network && item.core_network.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>רשת</Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.core_network}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <WifiIcon />
                  </Avatar>
                </Box>
              ) : null}

              {item.cert_infrastructure &&
              item.cert_infrastructure.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>תשתית תעודה</Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.cert_infrastructure}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <SecurityIcon />
                  </Avatar>
                </Box>
              ) : null}

              {item.backup_type && item.backup_type.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>גיבוי</Typography>
                    <Typography
                      sx={{
                        fontSize: "20",
                        fontWeight: "bold",
                        direction: "rtl",
                      }}
                    >
                      {item.backup_type}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <BackupIcon />
                  </Avatar>
                </Box>
              ) : null}

              {item.masad && item.masad.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>מסד</Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.masad}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <LocationCityTwoToneIcon />
                  </Avatar>
                </Box>
              ) : null}
            </Box>
          ))}

          {hasDeploymentSites && (
            <Box
              sx={{
                width: "1000px",
                display: "flex",
                flexDirection: "column",
                margin: "15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
                  אתרי פריסה
                </Typography>
                <PublicIcon sx={{ fontSize: 22, color: "text.secondary" }} />
              </Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "18px",
                  textAlign: "right",
                }}
              >
                אתרים בהם השירות פרוס ופועל בפועל
              </Typography>
            </Box>
          )}

          {data.map((item) => (
            <Box
              sx={{
                width: "1000px",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                padding: "10px",
                gap: 2,
              }}
            >
              {item.active_location && item.active_location.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    position: "relative",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>
                      מיקום נוכחי{" "}
                    </Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.active_location}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <PlaceIcon />
                  </Avatar>

                  {item.active_location === item.preferred_site && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "-10px",
                        left: "-10px",
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFD54F, #FFA000)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(255, 193, 7, 0.6)",
                        border: "2px solid #fff",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)" },
                          "50%": { transform: "scale(1.08)" },
                          "100%": { transform: "scale(1)" },
                        },
                      }}
                    >
                      <StarIcon
                        sx={{
                          color: "#fff",
                          fontSize: 22,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : null}

              {item.secondary_site && item.secondary_site.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    position: "relative",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>אתר משני</Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.secondary_site}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <HomeWorkIcon />
                  </Avatar>

                  {item.secondary_site === item.preferred_site && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "-10px",
                        left: "-10px",
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFD54F, #FFA000)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(255, 193, 7, 0.6)",
                        border: "2px solid #fff",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)" },
                          "50%": { transform: "scale(1.08)" },
                          "100%": { transform: "scale(1)" },
                        },
                      }}
                    >
                      <StarIcon
                        sx={{
                          color: "#fff",
                          fontSize: 22,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : null}

              {item.third_site && item.third_site.trim() !== "" ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    position: "relative",
                    height: "70px",
                    width: "315px",
                    padding: "10px",
                    gap: 2,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: "1px solid rgba(33, 150, 243, 0.2)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                      transform: "translateY(-4px)",
                      border: "1px solid rgba(33, 150, 243, 0.6)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <Typography sx={{ fontSize: "20" }}>אתר שלישי</Typography>
                    <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                      {item.third_site}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <HolidayVillageIcon />
                  </Avatar>

                  {item.third_site === item.preferred_site && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "-10px",
                        left: "-10px",
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFD54F, #FFA000)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(255, 193, 7, 0.6)",
                        border: "2px solid #fff",
                        animation: "pulse 2s infinite",
                        "@keyframes pulse": {
                          "0%": { transform: "scale(1)" },
                          "50%": { transform: "scale(1.08)" },
                          "100%": { transform: "scale(1)" },
                        },
                      }}
                    >
                      <StarIcon
                        sx={{
                          color: "#fff",
                          fontSize: 22,
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : null}
            </Box>
          ))}

          {depList && depList.length > 0 ? (
            <Box
              sx={{
                width: "1000px",
                display: "flex",
                flexDirection: "column",
                margin: "15px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  justifyContent: "flex-end",
                }}
              >
                <Typography sx={{ fontWeight: "bold", fontSize: "20px" }}>
                  תלויות
                </Typography>
                <LinkIcon sx={{ fontSize: 22, color: "text.secondary" }} />
              </Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "18px",
                  textAlign: "right",
                }}
              >
                רשימת מערכות, שירותים או רכיבים חיצוניים שבהם השירות תלוי לצורך
                תפקודו התקין
              </Typography>
            </Box>
          ) : null}

          {depList.map((item) => (
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: theme.palette.background.paper,
                  width: "1000px",
                  padding: "15px",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 6px 18px rgba(33, 150, 243, 0.25)",
                    transform: "translateY(-4px)",
                    border: "1px solid rgba(33, 150, 243, 0.6)",
                  },
                }}
              >
                <IconButton onClick={() => get_dep_info_data(item.id)}>
                  <ExpandIcon />
                </IconButton>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontSize: "20px" }}>
                    {item.dependency}
                  </Typography>

                  <Avatar
                    sx={{
                      backgroundImage:
                        "linear-gradient(135deg, #2196f3, #21cbf3)",
                      color: theme.palette.background.paper,
                      boxShadow: "0 3px 8px rgba(33, 150, 243, 0.35)",
                      transition: "all 0.25s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <DeviceHubIcon />
                  </Avatar>
                </Box>
              </Box>
            </Box>
          ))}

          {depInfoData.map((item) => (
            <Dialog
              open={depInfoDialog}
              onClose={handleCloseDepInfo}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle
                id="alert-dialog-title"
                sx={{ textAlign: "right", direction: "rtl" }}
              >
                מידע נוסף
              </DialogTitle>
              <DialogContent>
                <DialogContentText
                  id="alert-dialog-description"
                  sx={{ textAlign: "right", direction: "rtl" }}
                >
                  {item.description}
                </DialogContentText>
              </DialogContent>
            </Dialog>
          ))}

          {vmlistDialog && (
            <Dialog
              open={vmlistDialog}
              onClose={handleCloseVmlist}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              fullWidth
              maxWidth="lg"
            >
              <DialogTitle
                id="alert-dialog-title"
                sx={{ textAlign: "right", direction: "rtl" }}
              >
                <TextField
                  sx={{
                    backgroundColor: theme.palette.info.main,
                    width: "500px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .Mui-focused": {
                      backgroundColor: "transparent",
                      boxShadow: "none",
                    },
                  }}
                  variant="outlined"
                  value={searchQuery}
                  onChange={handle_query_change}
                  placeholder="ניתן לחפש שרת לפי השם שלו."
                />
              </DialogTitle>

              <DialogContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <strong>Title</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Site Location</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Network</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Cluster</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Host</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Ip</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Room</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Rack</strong>
                        </TableCell>
                        <TableCell>
                          <strong>Type</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {filtered_entities.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.title}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.site_location}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.network}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.cluster}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.host}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.ip}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.room}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.rack}
                          </TableCell>
                          <TableCell sx={{ direction: "rtl" }}>
                            {item.type}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showLinks} onClose={() => setShowLinks(false)}>
            <DialogTitle sx={{ textAlign: "center" }}>
              קישורים חיצוניים
            </DialogTitle>

            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {serviceLinks.map((item) => (
                <Link
                  sx={{
                    color: theme.palette.text.primary,
                    textAlign: "right",
                    width: "400px",
                  }}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.title}
                </Link>
              ))}
            </DialogContent>
          </Dialog>

          <Dialog open={showDocs} onClose={() => setShowDocs(false)}>
            <DialogTitle sx={{ textAlign: "center" }}>
              מסמכי השירות{" "}
            </DialogTitle>

            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {docsList.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      width: "400px",
                      gap: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/docs/${item.id}/?type=service`)}
                  >
                    <Typography>{item.title}</Typography>

                    <ArticleIcon />
                  </Box>
                ))}
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "90vh",
          }}
        >
          <CircularProgress sx={{ color: "#007FFF" }} />
        </Box>
      )}

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
            value={viewMode}
            label="Mode"
            onChange={handleViewModeChange}
          >
            <MenuItem value={"new"}>חדש</MenuItem>
            <MenuItem value={"old"}>ישן</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <GradientBlurLeft left_position="-100px" top_position="100px" />

      <GradientBlurRight right_position="-100px" top_position="150px" />

      <ViewServiceFiles
        service_id={id}
        show_files={showFiles}
        close_files={() => setShowFiles(false)}
      ></ViewServiceFiles>
    </>
  );
};
