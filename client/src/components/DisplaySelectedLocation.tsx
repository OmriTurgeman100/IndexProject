import {
    Box,
    Typography,
    Dialog,
    IconButton,
    Chip,
    Tooltip,
    TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import { useThemeContext } from "../hooks/useThemeContext";
import locationImg from "../assets/location.svg";


interface Locations {
    location: string;
    tag: string;
    count: string;
    environments: Environment[];
}

interface Environment {
    environment: string;
    count: number;
    items: Item[];
}

interface Item {
    id: number;
    name: string;
    type: string;
    backup: string;
    infrastructure: string | null;
    tag: string;
}

interface PropsData {
    show_location: boolean;
    close_location: () => void;
    location: Locations | null;
    handle_query_change: ((event: React.ChangeEvent<HTMLInputElement>) => void)
    searchQuery: string
}

const BackupColor = (tag: string, backup: string) => {
    if (tag === "מיקום נוכחי") return "success.light";
    if (tag === "אתר משני" && (backup === "יש (A-A)" || backup === "יש (A-A-A)")) return "success.light";
    if (tag === "אתר שלישי" && backup === "יש (A-A-A)") return "success.light";
    return "#9c9c9cff";
};

export const DisplaySelectedLocation = ({
    show_location,
    close_location,
    location,
    handle_query_change,
    searchQuery
}: PropsData) => {
    const { theme, isDarkMode } = useThemeContext();

    if (!location) return null;

    return (
        <Dialog
            open={show_location}
            onClose={close_location}
            fullScreen
            slotProps={{
                paper: {
                    sx: { bgcolor: theme.palette.background.default }
                }
            }}
        >
            <Box
                sx={{
                    width: "100vw",
                    height: "100vh",
                    padding: 3,
                    boxSizing: "border-box",
                }}
            >

                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        backgroundColor: theme.palette.background.paper,
                        padding: "25px",
                        borderRadius: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        border: "1px solid rgba(33, 150, 243, 0.2)",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                        overflow: "auto",
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: "14px",
                                    bgcolor: isDarkMode
                                        ? "rgba(100,149,237,0.15)"
                                        : "rgba(25,118,210,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <img src={locationImg} style={{ width: 32, height: 32 }} />
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <Typography sx={{ fontWeight: 600, fontSize: "20px" }}>
                                    {location.location}
                                </Typography>
                                <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                                    {location.tag}
                                </Typography>
                            </Box>

                        </Box>


                        <TextField
                            autoFocus
                            slotProps={{
                                input: {
                                    disableUnderline: true,
                                },
                            }}
                            sx={{
                                "& .MuiInputBase-input": {
                                    fontSize: "16px",
                                    color: theme.palette.text.primary,
                                    padding: "4px 0",
                                },
                                "& .MuiInputBase-input::placeholder": {
                                    color: isDarkMode ? "#a1a7b3" : "#7a8ba5",
                                    opacity: 1,
                                },
                                background: "transparent",
                                width: "250px",
                            }}
                            placeholder="Search"
                            variant="standard"
                            value={searchQuery}
                            onChange={handle_query_change}

                        />

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                            <Chip
                                sx={{

                                    bgcolor: "#E6F0FF",
                                    color: "#2793ffff",
                                    borderColor: "#5e9effff",
                                    fontWeight: 600,
                                }}
                                label={location.count}
                                variant="outlined"
                            />

                            <IconButton
                                onClick={close_location}
                                sx={{
                                    zIndex: 20,
                                }}
                            >
                                <CloseIcon />
                            </IconButton>

                        </Box>



                    </Box>

                    {/* Environments */}
                    <Box sx={{
                        display: "flex", flexDirection: "column", gap: 2.5, overflow: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none"
                        },
                    }}>
                        {location.environments.map((env) => (
                            <Box
                                key={env.environment}
                                sx={{
                                    pt: 1.5,
                                    borderTop: "1px solid rgba(0,0,0,0.04)",
                                }}
                            >
                                {/* Environment Header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        mb: 1.5,
                                    }}
                                >
                                    <CloudOutlinedIcon
                                        sx={{
                                            color: "#2793ffff",
                                            width: 32,
                                            height: 32,
                                        }}
                                    />
                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "18px",
                                        }}
                                    >
                                        {env.environment}
                                    </Typography>
                                    <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                                        ({env.count})
                                    </Typography>
                                </Box>

                                {/* Items */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 2,
                                        maxHeight: 260,
                                        overflowY: "auto",
                                        padding: "5px",
                                        "&::-webkit-scrollbar": { display: "none" },
                                    }}
                                >
                                    {env.items.map((item) => (
                                        <Tooltip
                                            key={item.id}
                                            title={`${item.name} • ${env.environment} • ${location.location}`}
                                            arrow
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        theme.palette.background.default,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    boxShadow: "0px 0px 6px rgba(0,0,0,0.15)",
                                                    fontWeight: 600,
                                                    fontSize: "12px",
                                                    textAlign: "center",
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        transform: "scale(1.06)",
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        bgcolor: BackupColor(item.tag, item.backup),
                                                        position: "absolute",
                                                        top: 6,
                                                        right: 6,
                                                    }}
                                                />
                                                {item.name}
                                            </Box>
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
};
