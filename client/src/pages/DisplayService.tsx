import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  get_specific_service,
  get_service_virtual_machines,
  get_service_dependencies,
  create_dependency_for_service,
  create_virtual_machine_for_service,
  // update_virtual_machine,
  update_virtual_machine_total,
  update_dependency,
  update_service,
  update_service_total,
  get_service_dep_info,
  post_service_dep_info,
  patch_service_dep_info,
  delete_service_dep_info,
  delete_service_dep,
  delete_service_vm,
  get_service_relationships,
  get_service_links,
  delete_service_link,
  update_service_link,
  create_service_link,
  display_service_docs,
  create_service_doc,
  display_service_sites,
} from "../services/Service";
import { useThemeContext } from "../hooks/useThemeContext";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
} from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import TextField from "@mui/material/TextField";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { VirtualMachinesUsageBar } from "../components/VmUsagePerEntity";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ExpandIcon from "@mui/icons-material/Expand";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HubIcon from "@mui/icons-material/Hub";
import { GradientBlurLeft } from "../components/GradientBlurLeft";
import { GradientBlurRight } from "../components/GradientBlurRight";
// import DnsIcon from "@mui/icons-material/Dns"; // For system_name (system/network-related)
import WarningIcon from "@mui/icons-material/Warning"; // For impact (to highlight High/Medium/Low risks)
// import PersonIcon from "@mui/icons-material/Person"; // For owned_by (ownership or user-related)
// import LocationCityIcon from "@mui/icons-material/LocationCity"; // For main_site (site or facility location)
// import PublicIcon from "@mui/icons-material/Public"; // For site_location (location or geographic area)
import LocationOnIcon from "@mui/icons-material/LocationOn"; // For masad (specific site/location)
import HomeWorkIcon from "@mui/icons-material/HomeWork"; // For secondary_site (secondary facility)
import BackupIcon from "@mui/icons-material/Backup"; // For backup_type (backup process/type)
// import DevicesIcon from "@mui/icons-material/Devices"; // For infrastructure_type (physical/virtual type)
// import VerifiedIcon from "@mui/icons-material/Verified"; // For system_uses_infrastructure_cert (certification use)
// import LockIcon from "@mui/icons-material/Lock"; // For cert_type (certification type)
import PlaceIcon from "@mui/icons-material/Place"; // For active_location (active site/location)
// import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import VpnKeyIcon from "@mui/icons-material/VpnKey"; // For system_id (represents databases or systems)
// import GroupIcon from "@mui/icons-material/Group"; // For owned_by (ownership or user-related)
import service_logo from "../assets/service_logo.svg";
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage";
import DescriptionIcon from "@mui/icons-material/Description";
// import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import GroupIcon from "@mui/icons-material/Group"; // For owned_by (ownership or user-related)
// import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import { get_systems_menu } from "../services/Get_Systems_Menu";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { create_dependency_for_system } from "../services/System";
import { create_system_authentication } from "../services/System";
import { post_system_core_dependency } from "../services/System";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import CloudIcon from "@mui/icons-material/Cloud";
import LinkIcon from "@mui/icons-material/Link";
import ArticleIcon from "@mui/icons-material/Article";
import { ServiceFiles } from "../components/ServiceFiles";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { ServiceExcelServers } from "../components/ServiceExcelServers";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";
import StarIcon from "@mui/icons-material/Star";
import { dependency_auto_suggestions } from "../services/Get_Visualization_Total";

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

interface CoreRelationships {
  system_id: number;
  system_name: string;
}

interface service_menu {
  system_id: number;
  system_name: string;
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

interface service_sites {
  site: string;
}

interface dependency_suggestions {
  dependency: string
}

export const DisplayService = () => {
  const { id } = useParams();
  const [data, setData] = useState<ServiceInfo[]>([]);
  const [serviceName, setServiceName] = useState<string>("");
  const [vmList, setVMList] = useState<VMInterface[]>([]);
  const [depList, setDepList] = useState<DependencyInterface[]>([]);
  const [editServiceInfo, setEditServiceInfo] = useState<boolean>(false);
  const [FormPlaceHolder, setFormPlaceHolder] = useState<string>("");
  const [EditServiceInfoCore, setEditServiceInfoCore] = useState(false);
  const [networkForm, setNetworkForm] = useState<string>("");
  const [nameForm, setNameForm] = useState<string>("");
  const [teamForm, setTeamForm] = useState<string>("");
  const [FormData, setFormData] = useState<string | boolean | number>("");
  const [CreateServer, setCreateServer] = useState<boolean>(false);
  const [CreateDep, setCreateDep] = useState<boolean>(false);
  const [ServerNameForm, setServerNameForm] = useState<string>("");
  const [ServerSiteForm, setServerSiteForm] = useState<string>("");
  const [ServiceDepForm, setServiceDepForm] = useState<string>("");
  const [ServerNetworkForm, setServerNetworkForm] = useState<string>("");
  const [ServerTypeForm, setServerTypeForm] = useState<string>("");
  const [ServerClusterForm, setServerClusterForm] = useState<string>("");
  const [ServerHostForm, setServerHostForm] = useState<string>("");
  const [ServerIpForm, setServerIpForm] = useState<string>("");
  const [ServerRoomForm, setServerRoomForm] = useState<string>("");
  const [ServerRackForm, setServerRackForm] = useState<string>("");
  const [editDep, setEditDep] = useState<boolean>(false);
  const [depId, setDepId] = useState<number>();
  const [editVm, setEditVm] = useState<boolean>(false);
  const [vmId, setVmId] = useState<number>();
  const [loading, setLoading] = useState<boolean>(true);
  const [depInfo, setDepInfo] = useState<boolean>(false);
  const [depInfoData, setInfoData] = useState<DepInfoService[]>([]);
  const [displayInfoEdit, setDisplayInfoEdit] = useState<boolean>(false);
  const [depInfoEditForm, setDepInfoEditForm] = useState<string>("");
  const [depInfoId, setDepInfoId] = useState<null | number | string>(null);
  const [depInfoPostForm, setDepInfoPostForm] = useState<string>("");
  const [displayDepInfoPost, setDisplayDepInfoPost] = useState<boolean>(false);
  const [ParentDepId, setParentDepId] = useState<null | number | string>(null);
  const [refreshDelete, setRefreshDelete] = useState<boolean>(false);
  const [relatedSystems, setRelatedSystems] = useState<CoreRelationships[]>([]);
  const [systemsMenu, setSystemsMenu] = useState<service_menu[]>([]);
  const [postCoreDep, setPostCoreDep] = useState<boolean>(false);
  const [mode, setMode] = useState<string>("dep");
  const [viewMode, setViewMode] = useState<string>("old");
  const [serviceLinks, setServiceLinks] = useState<service_links[]>([]);
  const [showLinks, setShowLinks] = useState<boolean>(false);
  const [EditLinks, setEditLinks] = useState<boolean>(false);
  const [postLinks, setPostLinks] = useState<boolean>(false);
  const [LinkId, setLinkId] = useState<number>();
  const [LinkTitleForm, setLinkTitleForm] = useState<string>("");
  const [LinkUrlForm, setLinkUrlForm] = useState<string>("");
  const [showDocs, setShowDocs] = useState<boolean>(false);
  const [postDocs, setPostDocs] = useState<boolean>(false);
  const [docsList, setDocsList] = useState<service_docs[]>([]);
  const [DocTitleForm, setDocTitleForm] = useState<string>("");
  const [ShowDescInput, setShowDescInput] = useState<boolean>(false);
  const [showFiles, setShowFiles] = useState<boolean>(false);
  const [excelUpload, setExcelUpload] = useState<boolean>(false);
  const [ServerRefresh, setServerRefresh] = useState<boolean>(false);
  const [expanded, setExpanded] = useState(false);
  const [serviceSites, setServiceSites] = useState<service_sites[]>([]);
  const [dependencySuggestions, setDependencySuggestions] = useState<dependency_suggestions[]>([])
  const navigate = useNavigate();

  const { theme } = useThemeContext();

  const fetch_data = async () => {
    try {
      const response = await get_specific_service(id);
      setData(response.data);

      setServiceName(response.data[0]["service_name"]);

      const virtual_machines = await get_service_virtual_machines(id);

      setVMList(virtual_machines.data);

      const dep = await get_service_dependencies(id);

      setDepList(dep.data);

      const related_systems = await get_service_relationships(id);

      setRelatedSystems(related_systems.data);

      const system_menu = await get_systems_menu();

      setSystemsMenu(system_menu.data);

      const service_links = await get_service_links(id);

      setServiceLinks(service_links.data);

      const service_docs = await display_service_docs(id);

      setDocsList(service_docs.data);

      const service_sites = await display_service_sites(id);

      setServiceSites(service_sites.data);

      setLoading(false);
    } catch (error: any) {
      console.error(error);

      if (error.response.status === 403) {
        navigate("/forbidden");
      }
    }
  };

  function handle_edit(entity: string, data: string | number | boolean): void {
    if (entity === "info") {
      setShowDescInput(true);
    } else {
      setShowDescInput(false);
    }

    setEditServiceInfo(true);
    setFormPlaceHolder(entity);
    setFormData(data);
  }

  const handle_change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(event.target.value);
  };

  const handle_server_name = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerNameForm(event.target.value);
  };

  const handle_server_site = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerSiteForm(event.target.value);
  };

  const handle_server_network = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setServerNetworkForm(event.target.value);
  };

  const handle_server_host = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerHostForm(event.target.value);
  };

  const handle_server_ip = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerIpForm(event.target.value);
  };

  const handle_server_type = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerTypeForm(event.target.value);
  };

  const handle_server_room = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerRoomForm(event.target.value);
  };

  const handle_server_rack = (event: React.ChangeEvent<HTMLInputElement>) => {
    setServerRackForm(event.target.value);
  };

  const handle_server_cluster = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setServerClusterForm(event.target.value);
  };

  const handle_dep = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {

      setServiceDepForm(event.target.value);

      const response = await dependency_auto_suggestions(event.target.value)

      setDependencySuggestions(response.data)


    } catch (error) {
      console.error(error)
    }

  };

  function ShowPostCoreDep(): void {
    setPostCoreDep(true);
  }
  function CloseCoreDep(): void {
    setPostCoreDep(false);
  }

  const handleChange = (event: SelectChangeEvent): void => {
    setMode(event.target.value as string);
  };

  const link_service_to_system = async (
    system_id: string | number | undefined,
    service_name: string,
  ) => {
    try {
      switch (mode) {
        case "dep":
          await create_dependency_for_system(system_id, service_name);
          break;
        case "auth":
          await create_system_authentication(system_id, service_name);
          break;
        default:
          break;
      }

      await post_system_core_dependency(system_id, id);

      setPostCoreDep(false);
    } catch (error) {
      console.error(error);
    }
  };

  async function handle_server_create() {
    try {
      await create_virtual_machine_for_service(
        id,
        ServerNameForm,
        ServerSiteForm,
        ServerNetworkForm,
        ServerTypeForm,
        ServerClusterForm,
        ServerHostForm,
        ServerIpForm,
        ServerRoomForm,
        ServerRackForm,
      );

      setCreateServer(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handle_dep_create() {
    try {
      await create_dependency_for_service(id, ServiceDepForm);

      setCreateDep(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handle_submit = async () => {
    try {
      await update_service(id, FormPlaceHolder, FormData);

      setEditServiceInfo(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_service_edit = async (
    impact: string,
    masad: string,
    secondary_site: string,
    backup_type: string,
    active_location: string,
    info: string,
    third_site: string,
    environment: string,
    cert_infrastructure: string,
    preferred_site: string,
  ) => {
    try {
      await update_service_total(
        id,
        nameForm,
        impact,
        networkForm,
        masad,
        secondary_site,
        backup_type,
        active_location,
        info,
        third_site,
        environment,
        cert_infrastructure,
        teamForm,
        preferred_site,
      );

      setEditServiceInfoCore(false);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_network_edit(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setNetworkForm(event.target.value);
  }

  function handle_team_edit(event: React.ChangeEvent<HTMLInputElement>): void {
    setTeamForm(event.target.value);
  }

  function handle_name_edit(event: React.ChangeEvent<HTMLInputElement>): void {
    setNameForm(event.target.value);
  }

  // async function handle_network_submit() {
  //   try {
  //     await update_service(id, "core_network", networkForm);

  //     setEditServiceInfoCore(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // async function handle_team_submit() {
  //   try {
  //     await update_service(id, "owned_by", teamForm);

  //     setEditServiceInfoCore(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // async function handle_name_submit() {
  //   try {
  //     await update_service(id, "service_name", nameForm);

  //     setEditServiceInfoCore(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  async function StartEditDep(dep_id: any, dependency: string) {
    setDepId(dep_id);

    setServiceDepForm(dependency);
    setEditDep(true);
  }

  async function StartEditVm(
    Vm_id: any,
    name: string,
    location: string,
    network: string,
    cluster: string,
    host: string,
    ip: string,
    type: string,
    room: string,
    rack: string,
  ) {
    setVmId(Vm_id);
    setServerNameForm(name);
    setServerSiteForm(location);
    setServerNetworkForm(network);
    setServerClusterForm(cluster);
    setServerHostForm(host);
    setServerIpForm(ip);
    setServerTypeForm(type);
    setServerRoomForm(room);
    setServerRackForm(rack);
    setEditVm(true);
  }

  async function handle_dep_post_edit(): Promise<void> {
    try {
      await update_dependency(depId, ServiceDepForm);

      setEditDep(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handle_vm_edit(): Promise<void> {
    try {
      await update_virtual_machine_total(
        vmId,
        ServerNameForm,
        ServerSiteForm,
        ServerNetworkForm,
        ServerTypeForm,
        ServerClusterForm,
        ServerHostForm,
        ServerIpForm,
        ServerRoomForm,
        ServerRackForm,
      );

      setEditVm(false);
    } catch (error) {
      console.error(error);
    }
  }

  // async function handle_vm_name_edit(): Promise<void> {
  //   try {
  //     await update_virtual_machine(vmId, "title", ServerNameForm);

  //     setEditVm(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // async function handle_vm_site_edit(): Promise<void> {
  //   try {
  //     await update_virtual_machine(vmId, "site_location", ServerSiteForm);

  //     setEditVm(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // async function handle_vm_network_edit(): Promise<void> {
  //   try {
  //     await update_virtual_machine(vmId, "network", ServerNetworkForm);

  //     setEditVm(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // async function handle_vm_type_edit(): Promise<void> {
  //   try {
  //     await update_virtual_machine(vmId, "type", ServerTypeForm);

  //     setEditVm(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // async function handle_vm_cluster_edit(): Promise<void> {
  //   try {
  //     await update_virtual_machine(vmId, "cluster", ServerClusterForm);

  //     setEditVm(false);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  async function display_dep(id: number): Promise<void> {
    try {
      const response = await get_service_dep_info(id);

      setParentDepId(id);

      setInfoData(response.data);

      setDepInfo(true);
    } catch (error) {
      console.error(error);
    }
  }

  function view_edit_dep_info(description: string, dep_info_id: number): void {
    setDepInfoEditForm(description);

    setDepInfoId(dep_info_id);

    setDisplayInfoEdit(true);
  }

  function handle_dep_info_edit(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setDepInfoEditForm(event.target.value);
  }

  const sumbit_dep_info_edit = async () => {
    try {
      await patch_service_dep_info(depInfoId, depInfoEditForm);

      setDisplayInfoEdit(false);
      setDepInfoId(null);
      setDepInfo(false);
    } catch (error) {
      console.error(error);
    }
  };

  function close_dialog(): void {
    setDepInfo(false);
    setDisplayInfoEdit(false);
  }

  function display_dep_info_post(): void {
    setDepInfo(false);
    setDisplayInfoEdit(false);

    setDisplayDepInfoPost(true);
  }

  function close_dialog_post(): void {
    setDisplayDepInfoPost(false);
  }

  const handle_post_dep_info = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDepInfoPostForm(event.target.value);
  };

  const sumbit_dep_info_post = async () => {
    try {
      await post_service_dep_info(id, ParentDepId, depInfoPostForm);

      setDisplayDepInfoPost(false);
      setDepInfo(false);
      setDisplayInfoEdit(false);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_core_edit(name: string, network: string, team: string): void {
    setNameForm(name);
    setNetworkForm(network);
    setTeamForm(team);
    setEditServiceInfoCore(true);
  }

  function create_dep(): void {
    setServiceDepForm("");
    setCreateDep(true);
  }

  function create_server(): void {
    setServerNameForm("");
    setServerSiteForm("");

    setCreateServer(true);
  }

  const delete_dep_info = async (id: string | number | undefined) => {
    try {
      await delete_service_dep_info(id);

      setRefreshDelete((prev) => !prev);

      setDepInfo(false);
    } catch (error) {
      console.error(error);
    }
  };

  const delete_dep = async (id: string | number | undefined) => {
    try {
      await delete_service_dep(id);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const delete_vm = async (id: string | number | undefined) => {
    try {
      await delete_service_vm(id);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewModeChange = (event: SelectChangeEvent): void => {
    setViewMode(event.target.value as string);
  };

  const handle_delete_link = async (link_id: number) => {
    try {
      await delete_service_link(link_id);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_edit_link_dialog(
    link_id: number,
    title: string,
    link: string,
  ): void {
    setShowLinks(false);
    setLinkId(link_id);
    setLinkTitleForm(title);
    setLinkUrlForm(link);
    setEditLinks(true);
  }

  function handle_link_title_edit(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setLinkTitleForm(event.target.value);
  }

  function handle_link_url_edit(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setLinkUrlForm(event.target.value);
  }

  const handle_edit_link_submit = async () => {
    try {
      await update_service_link(LinkId, LinkTitleForm, LinkUrlForm);

      setEditLinks(false);

      setLinkTitleForm("");

      setLinkUrlForm("");

      setShowLinks(true);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_post_link(): void {
    setLinkTitleForm("");

    setLinkUrlForm("");

    setPostLinks(true);
  }

  const handle_post_link_submit = async () => {
    try {
      await create_service_link(id, LinkTitleForm, LinkUrlForm);

      setPostLinks(false);

      setLinkTitleForm("");

      setLinkUrlForm("");

      setShowLinks(true);
    } catch (error) {
      console.error(error);
    }
  };

  function handle_redirect(): void {
    if (viewMode === "new") {
      navigate(`/services/view/${id}`);
    }
  }

  function handle_post_doc(): void {
    setDocTitleForm("");

    setPostDocs(true);
  }

  function handle_doc_title_edit(
    event: React.ChangeEvent<HTMLInputElement>,
  ): void {
    setDocTitleForm(event.target.value);
  }

  const handle_post_doc_submit = async () => {
    try {
      await create_service_doc(id, DocTitleForm);

      setPostDocs(false);

      setShowDocs(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const handle_selected_site_edit = async (event: SelectChangeEvent) => {
    try {
      await update_service(id, "preferred_site", event.target.value);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_selected_impact_edit = async (event: SelectChangeEvent) => {
    try {
      await update_service(id, "impact", event.target.value);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handle_selected_backup_edit = async (event: SelectChangeEvent) => {
    try {
      await update_service(id, "backup_type", event.target.value);

      setRefreshDelete((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetch_data();
    handle_redirect();
  }, [
    editServiceInfo,
    EditServiceInfoCore,
    CreateServer,
    CreateDep,
    editDep,
    editVm,
    depInfo,
    refreshDelete,
    postCoreDep,
    viewMode,
    EditLinks,
    postLinks,
    postDocs,
    ServerRefresh,
  ]);

  return (
    <>
      {loading === false ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            margin: "15px",
            alignItems: "center",
            gap: 1,
          }}
        >
          {data.map((item) => (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: "15px" }}
              key={item.service_id}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {item.service_name}
                </Typography>

                <img
                  src={service_logo}
                  style={{ width: "40px", height: "40px" }}
                ></img>
              </Box>

              {EditServiceInfoCore === false ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={() =>
                        handle_core_edit(
                          item.service_name,
                          item.core_network,
                          item.owned_by,
                        )
                      }
                    >
                      <EditIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton>

                    <Typography sx={{ fontSize: "15px" }}> עריכה</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => setShowDocs(true)}>
                      <ArticleIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton>

                    <Typography sx={{ fontSize: "15px" }}> מסמכים</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => setShowFiles(true)}>
                      <InsertDriveFileIcon
                        sx={{ color: theme.palette.text.primary }}
                      />
                    </IconButton>

                    <Typography sx={{ fontSize: "15px" }}> קבצים</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => setShowLinks(true)}>
                      <LinkIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton>

                    <Typography sx={{ fontSize: "15px" }}> קישורים</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(`/network/${id}`)}>
                      <HubIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton>

                    <Typography sx={{ fontSize: "15px" }}>קישוריות</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => navigate(`/tree/${id}/service`)}>
                      <AccountTreeIcon
                        sx={{ color: theme.palette.text.primary }}
                      />
                    </IconButton>

                    <Typography sx={{ fontSize: "15px" }}>
                      ארכיטקטורה
                    </Typography>
                  </Box>
                </Box>
              ) : null}

              {EditServiceInfoCore === false ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "1000px",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      width: "33%",
                      height: "70px",
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      px: "11px",
                      gap: 2,
                      overflow: "hidden",
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
                        {" "}
                        צוות מטפל
                      </Typography>

                      <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                        {item.owned_by}
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #2196f3, #21cbf3)",
                        color: theme.palette.background.paper,
                      }}
                    >
                      <GroupIcon />
                    </Avatar>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      width: "33%",
                      height: "70px",
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      px: "11px",
                      gap: 2,
                      overflow: "hidden",
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
                      <Typography sx={{ fontSize: "20" }}>רשת </Typography>

                      <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                        {item.core_network}
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #2196f3, #21cbf3)",
                        color: theme.palette.background.paper,
                      }}
                    >
                      <AccountTreeIcon />
                    </Avatar>
                  </Box>

                  <Box
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      width: "33%",
                      height: "70px",
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      px: "11px",
                      gap: 2,
                      overflow: "hidden",
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
                      <Typography sx={{ fontSize: "20" }}>מזהה</Typography>

                      <Typography sx={{ fontSize: "20", fontWeight: "bold" }}>
                        {item.service_id}
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        backgroundImage:
                          "linear-gradient(to right, #2196f3, #21cbf3)",
                        color: theme.palette.background.paper,
                      }}
                    >
                      <VpnKeyIcon />
                    </Avatar>
                  </Box>
                </Box>
              ) : (
                <Paper
                  sx={{
                    width: "1000px",
                    height: "fit-content",
                    borderRadius: 3,
                    backgroundColor: theme.palette.primary.main,
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 3,
                    position: "relative",
                  }}
                >
                  <IconButton
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                    onClick={() =>
                      handle_service_edit(
                        item.impact,
                        item.masad,
                        item.secondary_site,
                        item.backup_type,
                        item.active_location,
                        item.info,
                        item.third_site,
                        item.environment,
                        item.cert_infrastructure,
                        item.preferred_site,
                      )
                    }
                  >
                    <DoneIcon />
                  </IconButton>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* <IconButton
                      sx={{ backgroundColor: theme.palette.secondary.main }}
                      onClick={handle_team_submit}
                    >
                      <DoneIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton> */}

                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "230px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={teamForm}
                      onChange={handle_team_edit}
                      placeholder="צוות מטפל"
                    />
                    <Typography> צוות מטפל</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* <IconButton
                      sx={{ backgroundColor: theme.palette.secondary.main }}
                      onClick={handle_network_submit}
                    >
                      <DoneIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton> */}

                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "230px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={networkForm}
                      onChange={handle_network_edit}
                      placeholder="רשת"
                    />
                    <Typography>רשת</Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* <IconButton
                      sx={{ backgroundColor: theme.palette.secondary.main }}
                      onClick={handle_name_submit}
                    >
                      <DoneIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton> */}

                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "230px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={nameForm}
                      onChange={handle_name_edit}
                      placeholder=" שם שירות"
                    />
                    <Typography>שם</Typography>
                  </Box>

                  <IconButton
                    sx={{ position: "absolute", top: 0, left: 0 }}
                    onClick={() => setEditServiceInfoCore(false)}
                  >
                    <CloseIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>
                </Paper>
              )}

              {/* <Typography sx={{ textAlign: "center" }} component="span">
                מידע נוסף
              </Typography> */}

              {editServiceInfo === false ? (
                <Accordion
                  defaultExpanded
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    width: "1000px",
                    borderRadius: 1,
                    boxShadow: 1,
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  ></AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table>
                        {/* <TableHead>
                          <TableRow>
                            <TableCell>
                              <strong>Property</strong>
                            </TableCell>
                            <TableCell>
                              <strong>Value</strong>
                            </TableCell>
                          </TableRow>
                        </TableHead> */}
                        <TableBody>
                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                {item.active_location}
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit(
                                    "active_location",
                                    item.active_location,
                                  )
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>מיקום נוכחי</strong>
                                <PlaceIcon />
                              </Box>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                <Box sx={{ minWidth: 120 }}>
                                  <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                      השפעה
                                    </InputLabel>
                                    <Select
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={item.impact}
                                      label="השפעה"
                                      onChange={handle_selected_impact_edit}
                                    >
                                      <MenuItem value={"נמוכה"}>נמוכה</MenuItem>
                                      <MenuItem value={"בינונית"}>
                                        בינונית
                                      </MenuItem>
                                      <MenuItem value={"גבוהה"}>גבוהה</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit("impact", item.impact)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>השפעה</strong>
                                <WarningIcon />
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell
                                sx={{ direction: "rtl", textAlign: "right" }}
                              >
                                {item.info}
                              </TableCell>
                              <IconButton
                                onClick={() => handle_edit("info", item.info)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>תיאור</strong>
                                <DescriptionIcon />
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                {item.environment}
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit("environment", item.environment)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>סביבה</strong>
                                <CloudIcon />
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                {item.cert_infrastructure}
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit(
                                    "cert_infrastructure",
                                    item.cert_infrastructure,
                                  )
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>תשתית תעודה</strong>
                                <SecurityIcon />
                              </Box>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                <Box sx={{ minWidth: 120 }}>
                                  <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                      גיבוי
                                    </InputLabel>
                                    <Select
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={item.backup_type}
                                      label="גיבוי"
                                      onChange={handle_selected_backup_edit}
                                    >
                                      <MenuItem
                                        value={"אין"}
                                        sx={{ direction: "rtl" }}
                                      >
                                        אין
                                      </MenuItem>
                                      <MenuItem
                                        value={"יש (קר)"}
                                        sx={{ direction: "rtl" }}
                                      >
                                        יש (קר)
                                      </MenuItem>
                                      <MenuItem
                                        value={"יש (A-A)"}
                                        sx={{ direction: "rtl" }}
                                      >
                                        יש (A-A)
                                      </MenuItem>
                                      <MenuItem
                                        value={"יש (A-A-A)"}
                                        sx={{ direction: "rtl" }}
                                      >
                                        יש (A-A-A)
                                      </MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit("backup_type", item.backup_type)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>סוג גיבוי</strong>
                                <BackupIcon />
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                {item.masad}
                              </TableCell>
                              <IconButton
                                onClick={() => handle_edit("masad", item.masad)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>מסד</strong>

                                <LocationOnIcon />
                              </Box>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                {item.secondary_site}
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit(
                                    "secondary_site",
                                    item.secondary_site,
                                  )
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>אתר משני</strong>

                                <HomeWorkIcon />
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                {item.third_site}
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit("third_site", item.third_site)
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong> אתר שלישי</strong>
                                <HolidayVillageIcon />
                              </Box>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <TableCell sx={{ direction: "rtl" }}>
                                <Box sx={{ minWidth: 120 }}>
                                  <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                      אתר מועדף
                                    </InputLabel>
                                    <Select
                                      labelId="demo-simple-select-label"
                                      id="demo-simple-select"
                                      value={item.preferred_site}
                                      label="אתר מועדף"
                                      onChange={handle_selected_site_edit}
                                    >
                                      {serviceSites.map((item) => (
                                        <MenuItem
                                          value={item.site}
                                          key={item.site}
                                        >
                                          {item.site}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Box>
                              </TableCell>
                              <IconButton
                                onClick={() =>
                                  handle_edit(
                                    "preferred_site",
                                    item.preferred_site,
                                  )
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <strong>אתר מועדף</strong>
                                <StarIcon />
                              </Box>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <>
                  {ShowDescInput === false ? (
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <IconButton
                        sx={{ backgroundColor: theme.palette.secondary.main }}
                        onClick={handle_submit}
                      >
                        <DoneIcon sx={{ color: theme.palette.text.primary }} />
                      </IconButton>

                      <IconButton
                        sx={{ backgroundColor: theme.palette.secondary.main }}
                        onClick={() => setEditServiceInfo(false)}
                      >
                        <CloseIcon sx={{ color: theme.palette.text.primary }} />
                      </IconButton>

                      <TextField
                        sx={{
                          backgroundColor: theme.palette.secondary.main,
                          width: "900px",
                          borderRadius: "35px",
                          padding: "10px 15px",
                          "& .MuiInputBase-root": {
                            fontSize: "16px",
                            fontWeight: 400,
                          },
                          "& .MuiInputBase-input": {
                            padding: "0 10px",
                            color: theme.palette.text.primary,
                            direction: "rtl",
                            textAlign: "right",
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
                        value={FormData}
                        onChange={handle_change}
                        placeholder={FormPlaceHolder}
                      />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center",
                        flexDirection: "column",
                        marginBottom: 2,
                      }}
                    >
                      <TextField
                        multiline
                        minRows={4}
                        maxRows={10}
                        sx={{
                          backgroundColor: theme.palette.secondary.main,
                          width: "100%",
                          borderRadius: "15px",
                          "& .MuiInputBase-root": {
                            fontSize: "16px",
                            fontWeight: 400,
                          },
                          "& .MuiInputBase-input": {
                            padding: "10px",
                            color: theme.palette.text.primary,
                            direction: "rtl",
                            textAlign: "right",
                            whiteSpace: "pre-wrap",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        }}
                        variant="outlined"
                        value={FormData}
                        onChange={handle_change}
                        placeholder="הכנס תיאור מפורט כאן..."
                      />

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 3 }}
                      >
                        <IconButton
                          sx={{ backgroundColor: theme.palette.secondary.main }}
                          onClick={handle_submit}
                        >
                          <DoneIcon
                            sx={{ color: theme.palette.text.primary }}
                          />
                        </IconButton>

                        <IconButton
                          sx={{ backgroundColor: theme.palette.secondary.main }}
                          onClick={() => setEditServiceInfo(false)}
                        >
                          <CloseIcon
                            sx={{ color: theme.palette.text.primary }}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </>
              )}
            </Box>
          ))}

          {editVm === false ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              {CreateServer === false ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <IconButton
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                    onClick={create_server}
                  >
                    <AddIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>

                  <IconButton
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                    onClick={() => setExcelUpload(true)}
                  >
                    <DriveFolderUploadIcon />
                  </IconButton>

                  <Typography component="span">שרתים</Typography>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <IconButton
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                    onClick={handle_server_create}
                  >
                    <DoneIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>

                  <IconButton
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                    onClick={() => setCreateServer(false)}
                  >
                    <CloseIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "100px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerTypeForm}
                      onChange={handle_server_type}
                      placeholder="type"
                    />

                    <Typography> סוג </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "100px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerRackForm}
                      onChange={handle_server_rack}
                      placeholder="rack..."
                    />

                    <Typography> מסד </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "100px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerRoomForm}
                      onChange={handle_server_room}
                      placeholder="room..."
                    />

                    <Typography> חדר </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "155px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerIpForm}
                      onChange={handle_server_ip}
                      placeholder="ip..."
                    />

                    <Typography> כתובת </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "155px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerHostForm}
                      onChange={handle_server_host}
                      placeholder="host..."
                    />

                    <Typography> שרת פיזי </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "155px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerClusterForm}
                      onChange={handle_server_cluster}
                      placeholder="cluster..."
                    />

                    <Typography> קלאסטר </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "155px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerNetworkForm}
                      onChange={handle_server_network}
                      placeholder="network"
                    />

                    <Typography> רשת </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "155px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerSiteForm}
                      onChange={handle_server_site}
                      placeholder="site_location"
                    />

                    <Typography>מיקום </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "155px",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServerNameForm}
                      onChange={handle_server_name}
                      placeholder="title"
                    />
                    <Typography>שם </Typography>
                  </Box>
                </Box>
              )}

              {vmList.length > 0 ? (
                <Accordion
                  expanded={expanded}
                  onChange={handleToggle}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    width: expanded ? "1300px" : "1000px",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                  ></AccordionSummary>
                  <AccordionDetails>
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
                          {vmList.map((item) => (
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

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  position: "relative",
                                }}
                              >
                                <TableCell>{item.type}</TableCell>
                                <IconButton
                                  onClick={() =>
                                    StartEditVm(
                                      item.id,
                                      item.title,
                                      item.site_location,
                                      item.network,
                                      item.cluster,
                                      item.host,
                                      item.ip,
                                      item.type,
                                      item.room,
                                      item.rack,
                                    )
                                  }
                                >
                                  <EditIcon />
                                </IconButton>

                                <IconButton
                                  sx={{ position: "absolute", right: 30 }}
                                  onClick={() => delete_vm(item.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ) : (
                <Box
                  sx={{
                    width: "1000px",
                    backgroundColor: theme.palette.primary.main,
                    padding: 1,
                    borderRadius: "10px",
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>אין</Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={handle_vm_edit}
              >
                <DoneIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>

              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={() => setEditVm(false)}
              >
                <CloseIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "100px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerTypeForm}
                  onChange={handle_server_type}
                  placeholder="type..."
                />

                <Typography> סוג </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "100px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerRackForm}
                  onChange={handle_server_rack}
                  placeholder="rack..."
                />

                <Typography> מסד </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "100px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerRoomForm}
                  onChange={handle_server_room}
                  placeholder="room..."
                />

                <Typography> חדר </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "155px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerIpForm}
                  onChange={handle_server_ip}
                  placeholder="ip..."
                />

                <Typography> כתובת </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "155px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerHostForm}
                  onChange={handle_server_host}
                  placeholder="host..."
                />

                <Typography> שרת פיזי </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "120px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerClusterForm}
                  onChange={handle_server_cluster}
                  placeholder="cluster..."
                />

                <Typography>קלאסטר </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "120px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerNetworkForm}
                  onChange={handle_server_network}
                  placeholder="network..."
                />

                <Typography> רשת </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "120px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerSiteForm}
                  onChange={handle_server_site}
                  placeholder="site location..."
                />

                <Typography>מיקום שרת </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "120px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServerNameForm}
                  onChange={handle_server_name}
                  placeholder="name..."
                />

                <Typography>שם שרת </Typography>
              </Box>
            </Box>
          )}
          {/* <Typography sx={{ textAlign: "center" }} component="span">
            פרטים נוספים
          </Typography> */}
          {editDep === false ? (
            <Box
              sx={{
                width: "1000px",
                // backgroundColor: theme.palette.primary.main,
                borderRadius: "10px",
                height: "fit-content",
                padding: "5px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {CreateDep === false ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    sx={{ backgroundColor: theme.palette.secondary.main }}
                    onClick={create_dep}
                  >
                    <AddIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>

                  <Typography
                    sx={{ textAlign: "center", margin: "5px" }}
                    component="span"
                  >
                    תלויות
                  </Typography>
                </Box>
              ) : (

                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      sx={{ backgroundColor: theme.palette.secondary.main }}
                      onClick={handle_dep_create}
                    >
                      <DoneIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton>
                    <IconButton
                      sx={{ backgroundColor: theme.palette.secondary.main }}
                      onClick={() => setCreateDep(false)}
                    >
                      <CloseIcon sx={{ color: theme.palette.text.primary }} />
                    </IconButton>

                    <TextField
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        width: "90%",
                        borderRadius: "35px",
                        padding: "10px 15px",
                        "& .MuiInputBase-root": {
                          fontSize: "16px",
                          fontWeight: 400,
                        },
                        "& .MuiInputBase-input": {
                          padding: "0 10px",
                          color: theme.palette.text.primary,
                          direction: "rtl",
                          textAlign: "right",
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
                      value={ServiceDepForm}
                      onChange={handle_dep}
                      placeholder="תלויות שירות"
                    />
                    <Typography>תלויות</Typography>
                  </Box>


                  {dependency_auto_suggestions.length > 0 && (
                    <Box
                      sx={{
                        maxHeight: "300px",
                        height: "fit-content",
                        width: "100%",
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        overflow: "auto",
                        zIndex: 20,
                      }}
                    >
                      {dependencySuggestions.map((item, index) => (
                        <Box
                          key={index}
                          onClick={() => {
                            setServiceDepForm(item.dependency);
                            setDependencySuggestions([]);
                          }}
                          sx={{
                            px: 2,
                            py: 1,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                            textAlign: "right",
                            direction: "rtl"
                          }}
                        >
                          {item.dependency}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {depList && depList.length > 0 ? (
                  depList.map((item) => (
                    <Box
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        borderRadius: 5,
                        padding: "5px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <Typography sx={{ textAlign: "center" }}>
                        {item.dependency}
                      </Typography>

                      <IconButton
                        sx={{ position: "absolute", right: 0 }}
                        onClick={() => display_dep(item.id)}
                      >
                        <ExpandIcon
                          sx={{ color: theme.palette.text.primary }}
                        />
                      </IconButton>

                      <IconButton
                        sx={{ position: "absolute", right: 30 }}
                        onClick={() => delete_dep(item.id)}
                      >
                        <DeleteIcon
                          sx={{ color: theme.palette.text.primary }}
                        />
                      </IconButton>

                      <IconButton
                        onClick={() => StartEditDep(item.id, item.dependency)}
                      >
                        <EditIcon sx={{ color: theme.palette.text.primary }} />
                      </IconButton>
                    </Box>
                  ))
                ) : (
                  <Box
                    sx={{
                      backgroundColor: theme.palette.secondary.main,
                      borderRadius: 5,
                      padding: "5px",
                    }}
                  >
                    <Typography sx={{ textAlign: "center" }}>אין</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : editDep === true ? (

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  sx={{ backgroundColor: theme.palette.secondary.main }}
                  onClick={handle_dep_post_edit}
                >
                  <DoneIcon sx={{ color: theme.palette.text.primary }} />
                </IconButton>
                <IconButton
                  sx={{ backgroundColor: theme.palette.secondary.main }}
                  onClick={() => setEditDep(false)}
                >
                  <CloseIcon sx={{ color: theme.palette.text.primary }} />
                </IconButton>

                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "810px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={ServiceDepForm}
                  onChange={handle_dep}
                  placeholder="dependency"
                />
                <Typography> ערוך תלות</Typography>
              </Box>

              {dependency_auto_suggestions.length > 0 && (
                <Box
                  sx={{
                    maxHeight: "300px",
                    height: "fit-content",
                    width: "100%",
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    overflow: "auto",
                    zIndex: 20,
                  }}
                >
                  {dependencySuggestions.map((item, index) => (
                    <Box
                      key={index}
                      onClick={() => {
                        setServiceDepForm(item.dependency);
                        setDependencySuggestions([]);
                      }}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: theme.palette.action.hover },
                        textAlign: "right",
                        direction: "rtl"
                      }}
                    >
                      {item.dependency}
                    </Box>
                  ))}
                </Box>
              )}

            </Box>


          ) : null}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              sx={{ backgroundColor: theme.palette.primary.main }}
              onClick={ShowPostCoreDep}
            >
              <AddIcon />
            </IconButton>

            <Typography>מערכות המשתמשות בשירות </Typography>
          </Box>

          {relatedSystems && relatedSystems.length > 0 ? (
            <Box
              sx={{
                width: "1000px",
                // backgroundColor: theme.palette.primary.main,
                borderRadius: "10px",
                height: "fit-content",
                padding: "5px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {relatedSystems.map((item) => (
                <Box
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    borderRadius: 5,
                    padding: "5px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Link to={`/systems/${item.system_id}`}>
                    {item.system_name}

                    <IconButton>
                      <OpenInNewIcon />
                    </IconButton>
                  </Link>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                width: "1000px",
                backgroundColor: theme.palette.primary.main,
                borderRadius: "10px",
                height: "fit-content",
                padding: "5px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <Box
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: 5,
                  padding: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  width: "100%",
                }}
              >
                <Typography>אין</Typography>
              </Box>
            </Box>
          )}

          <Paper
            sx={{
              width: "1000px",
              marginTop: "5px",
              backgroundColor: theme.palette.primary.main,
              padding: "5px",
            }}
          >
            <VirtualMachinesUsageBar type="service" id={id} />
          </Paper>

          <Dialog open={depInfo} onClose={close_dialog} fullWidth maxWidth="sm">
            <DialogTitle sx={{ textAlign: "center" }}>מידע נוסף</DialogTitle>

            <IconButton
              sx={{ position: "absolute" }}
              onClick={display_dep_info_post}
            >
              <AddIcon />
            </IconButton>

            {displayInfoEdit === false ? (
              <DialogContent>
                {depInfoData.map((item) => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography>{item.description}</Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IconButton
                        onClick={() =>
                          view_edit_dep_info(item.description, item.id)
                        }
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton onClick={() => delete_dep_info(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </DialogContent>
            ) : (
              <DialogContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    direction: "rtl",
                    textAlign: "right",
                  }}
                >
                  <TextField
                    sx={{ width: "100%" }}
                    id="outlined-multiline-flexible"
                    label=""
                    multiline
                    value={depInfoEditForm}
                    onChange={handle_dep_info_edit}
                    maxRows={4}
                  />

                  <IconButton onClick={sumbit_dep_info_edit}>
                    <DoneIcon />
                  </IconButton>
                </Box>
              </DialogContent>
            )}
          </Dialog>

          <Dialog
            open={displayDepInfoPost}
            onClose={close_dialog_post}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle sx={{ textAlign: "center" }}>הוסף מידע </DialogTitle>

            <DialogContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  direction: "rtl",
                  textAlign: "right",
                }}
              >
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-multiline-flexible"
                  label=""
                  multiline
                  value={depInfoPostForm}
                  onChange={handle_post_dep_info}
                  maxRows={4}
                />

                <IconButton onClick={sumbit_dep_info_post}>
                  <DoneIcon />
                </IconButton>
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog open={postCoreDep} onClose={CloseCoreDep}>
            <Box sx={{ display: "flex", alignItems: "center", padding: 1 }}>
              <FormControl sx={{ width: "130px" }}>
                <InputLabel id="demo-simple-select-label">מצב</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={mode}
                  label="Mode"
                  onChange={handleChange}
                >
                  <MenuItem value={"dep"}>תלות</MenuItem>
                  <MenuItem value={"auth"}>הזדהות</MenuItem>
                </Select>
              </FormControl>

              <DialogTitle>אנא בחר מערכת</DialogTitle>
            </Box>

            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {systemsMenu.map((item) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography>{item.system_name}</Typography>

                  <IconButton
                    onClick={() =>
                      link_service_to_system(item.system_id, serviceName)
                    }
                    sx={{ backgroundColor: theme.palette.primary.main }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              ))}
            </DialogContent>
          </Dialog>

          <Dialog open={showLinks} onClose={() => setShowLinks(false)}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={handle_post_link}
              >
                <AddIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>

              <DialogTitle>קישורים חיצוניים</DialogTitle>
            </Box>

            <DialogContent>
              {serviceLinks.map((item) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    width: "400px",
                    gap: 1,
                  }}
                >
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>

                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                      onClick={() =>
                        handle_edit_link_dialog(item.id, item.title, item.link)
                      }
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton onClick={() => handle_delete_link(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </DialogContent>
          </Dialog>

          <Dialog open={EditLinks} onClose={() => setEditLinks(false)}>
            <DialogTitle sx={{ textAlign: "center" }}>ערוך קישור</DialogTitle>

            <DialogContent
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "400px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={LinkTitleForm}
                  onChange={handle_link_title_edit}
                  placeholder="שם קישור"
                />
                <Typography>שם קישור </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "400px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={LinkUrlForm}
                  onChange={handle_link_url_edit}
                  placeholder="כתובת קישור"
                />
                <Typography> כתובת</Typography>
              </Box>
            </DialogContent>

            <IconButton onClick={handle_edit_link_submit}>
              <DoneIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
          </Dialog>

          <Dialog open={postLinks} onClose={() => setPostLinks(false)}>
            <DialogTitle sx={{ textAlign: "center" }}>הוספת קישור</DialogTitle>

            <DialogContent
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "400px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={LinkTitleForm}
                  onChange={handle_link_title_edit}
                  placeholder="שם קישור"
                />
                <Typography>שם קישור </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "400px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={LinkUrlForm}
                  onChange={handle_link_url_edit}
                  placeholder="כתובת קישור"
                />
                <Typography> כתובת</Typography>
              </Box>
            </DialogContent>

            <IconButton onClick={handle_post_link_submit}>
              <DoneIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
          </Dialog>

          <Dialog open={showDocs} onClose={() => setShowDocs(false)}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconButton
                sx={{ backgroundColor: theme.palette.secondary.main }}
                onClick={handle_post_doc}
              >
                <AddIcon sx={{ color: theme.palette.text.primary }} />
              </IconButton>

              <DialogTitle>מסמכי השירות </DialogTitle>
            </Box>

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

          <Dialog open={postDocs} onClose={() => setPostDocs(false)}>
            <DialogTitle sx={{ textAlign: "center" }}>הוספת מסמך</DialogTitle>

            <DialogContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    width: "400px",
                    borderRadius: "35px",
                    padding: "10px 15px",
                    "& .MuiInputBase-root": {
                      fontSize: "16px",
                      fontWeight: 400,
                    },
                    "& .MuiInputBase-input": {
                      padding: "0 10px",
                      color: theme.palette.text.primary,
                      direction: "rtl",
                      textAlign: "right",
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
                  value={DocTitleForm}
                  onChange={handle_doc_title_edit}
                  placeholder="שם מסמך"
                />
                <Typography>שם מסמך </Typography>
              </Box>
            </DialogContent>

            <IconButton onClick={handle_post_doc_submit}>
              <DoneIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
          </Dialog>

          <GradientBlurLeft left_position="-100px" top_position="100px" />

          <GradientBlurRight right_position="-100px" top_position="150px" />

          <ServiceFiles
            service_id={id}
            show_files={showFiles}
            close_files={() => setShowFiles(false)}
          ></ServiceFiles>

          <ServiceExcelServers
            service_id={id}
            show_upload={excelUpload}
            close_upload={() => setExcelUpload(false)}
            refresh={() => setServerRefresh((prev) => !prev)}
            open_servers={() => setExpanded(true)}
          ></ServiceExcelServers>

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
    </>
  );
};
