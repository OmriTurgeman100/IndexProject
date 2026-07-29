import {
    Box,
    Typography,
    Chip,
    Tooltip,
} from "@mui/material";
import { useThemeContext } from "../hooks/useThemeContext";
import location from "../assets/location.svg"
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import { useState, useEffect } from "react";
import { DisplaySelectedLocation } from "./DisplaySelectedLocation";

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
    locations: Locations[]
    handle_query_change: ((event: React.ChangeEvent<HTMLInputElement>) => void)
    searchQuery: string
    focusSearchInput: () => void
}

export const DisplayLocations = ({ locations, handle_query_change, searchQuery, focusSearchInput }: PropsData) => {
    const { theme, isDarkMode } = useThemeContext();
    const [displayLocation, setDisplayLocation] = useState<boolean>(false)
    const [selectedLocation, setSelectedLocation] = useState<Locations | null>(null)

    const BackupColor = (tag: string, backup: string) => {
        if (tag === "מיקום נוכחי") return "success.light";
        if (tag === "אתר משני" && (backup === "יש (A-A)" || backup === "יש (A-A-A)")) return "success.light";
        if (tag === "אתר שלישי" && backup === "יש (A-A-A)") return "success.light";
        return "#9c9c9cff";
    };

    function display_location(location: Locations): void {
        setSelectedLocation(location)

        setDisplayLocation(true)
    }

    function close_location(): void {
        setSelectedLocation(null)

        setDisplayLocation(false)

        setTimeout(() => {
            focusSearchInput();
        }, 0);

    }

    useEffect(() => {
        if (!selectedLocation) return;

        const updated = locations.find(
            (loc) => loc.location === selectedLocation.location
        );

        if (updated) {
            setSelectedLocation(updated);
        }
    }, [locations, selectedLocation]);

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "stretch",
                gap: 2,
                width: "100%",
                height: "80%",
                maxWidth: 1500,
            }}
        >
            {locations.map((locationItem) => (
                <Box
                    onClick={() => display_location(locationItem)}
                    key={locationItem.location}
                    sx={{
                        flex: "1",
                        maxWidth: 480,
                        height: "850px",
                        backgroundColor: theme.palette.background.paper,
                        padding: "25px",
                        borderRadius: 4,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        border: "1px solid rgba(33, 150, 243, 0.2)",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.25s ease-in-out",
                        cursor: "default",
                        overflow: "hidden",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none"
                        },
                        "&:hover": {
                            boxShadow: "0 8px 20px rgba(33, 150, 243, 0.28)",
                            transform: "translateY(-4px)",
                            border: "1px solid rgba(33, 150, 243, 0.6)",
                            backgroundImage:
                                "linear-gradient(to bottom, rgba(39,147,255,0.03), transparent)",
                        },
                    }}
                >
                    {/* Card header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            gap: 2,
                        }}
                    >
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
                                flexShrink: 0,
                            }}
                        >
                            <img src={location} style={{ width: 32, height: 32 }} />
                        </Box>



                        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px", justifyContent: "flex-start" }}>

                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    letterSpacing: "0.3px",
                                    fontSize: "20px",
                                }}
                            >
                                {locationItem.location}

                            </Typography>

                            <Typography
                                sx={{ fontSize: "0.9rem", color: "text.secondary" }}
                            >
                                {locationItem.tag}
                            </Typography>

                        </Box>

                        <Chip
                            sx={{
                                marginLeft: "auto",
                                bgcolor: "#E6F0FF",
                                color: "#2793ffff",
                                borderColor: "#5e9effff",
                                fontWeight: 600,
                            }}
                            label={locationItem.count}
                            variant="outlined"
                        />
                    </Box>

                    {/* Environments */}
                    <Box sx={{
                        display: "flex", flexDirection: "column", gap: 2.5, overflow: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none"
                        },
                    }}>
                        {locationItem.environments.map((env) => (
                            <Box
                                key={env.environment}
                                sx={{
                                    pt: 1.5,
                                    borderTop: "1px solid rgba(0, 0, 0, 0.04)",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "flex-start",
                                        alignItems: "center",
                                        gap: 1.5,
                                        mb: 1.5,
                                        transition: "color 0.2s ease",
                                    }}
                                >
                                    <CloudOutlinedIcon
                                        sx={{
                                            color: "#2793ffff",
                                            width: "32px",
                                            height: "32px",
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontWeight: "bold",
                                            fontSize: "18px",
                                            "&:hover": {
                                                textDecoration: "underline",
                                            },
                                        }}
                                    >
                                        {env.environment}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "14px",
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        ({env.count})
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        width: "100%",
                                        maxHeight: "190px",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        overflowY: "auto",
                                        gap: 2,
                                        padding: "5px",
                                        alignItems: "center",
                                        scrollbarWidth: "none",
                                        "&::-webkit-scrollbar": {
                                            display: "none"
                                        },
                                    }}
                                >
                                    {env.items.map((envItem) => (
                                        <Tooltip
                                            key={envItem.name}
                                            title={`${envItem.name} • ${env.environment} • ${locationItem.location}`}
                                            arrow
                                        >
                                            <Box
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    borderRadius: "50%",
                                                    backgroundColor: theme.palette.background.default,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    boxShadow: "0px 0px 6px rgba(0,0,0,0.15)",
                                                    fontWeight: 600,
                                                    fontSize: "12px",
                                                    textAlign: "center",
                                                    padding: "5px",
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    transition:
                                                        "transform 0.18s ease, box-shadow 0.18s ease",
                                                    "&:hover": {
                                                        transform: "scale(1.06)",
                                                        boxShadow:
                                                            "0px 0px 10px rgba(0,0,0,0.22)",
                                                    },
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        bgcolor: BackupColor(envItem.tag, envItem.backup),
                                                        position: "absolute",
                                                        top: 6,
                                                        right: 6,
                                                    }}
                                                />
                                                {envItem.name}
                                            </Box>
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}

            <DisplaySelectedLocation
                show_location={displayLocation}
                close_location={close_location}
                location={selectedLocation}
                handle_query_change={handle_query_change}
                searchQuery={searchQuery}
            />

        </Box>
    )
}
