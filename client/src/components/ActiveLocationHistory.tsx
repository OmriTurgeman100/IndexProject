import { get_active_location_history } from "../services/Get_Visualization_Total"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography
} from "@mui/material";


interface active_location_logs {
    id: number
    entity_id: number
    active_location: string
    started_at: string
    ended_at: string | null
}

interface PropsData {
    entity_id: number
    type: string
    show_history: boolean;
    close_history: () => void;
}

const ActiveLocationHistory = ({ entity_id, type, show_history, close_history }: PropsData) => {

    const [activeLocationsHistory, setActiveLocationsHistory] = useState<active_location_logs[]>([])

    const fetch_active_location_logs = async () => {
        try {

            const response = await get_active_location_history(entity_id, type)

            setActiveLocationsHistory(response.data)

        } catch (error) {
            console.error(error)
        }
    }


    useEffect(() => {
        fetch_active_location_logs()
    }, [entity_id, type])


    return (
        <Dialog
            open={show_history}
            onClose={close_history}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 5,
                    bgcolor: "#f8fafc",
                },
            }}
        >
            <Box dir="rtl">
                <DialogTitle
                    sx={{
                        px: 3,
                        py: 2.5,
                        textAlign: "right",
                        fontWeight: 900,
                        fontSize: 22,
                        color: "#0f172a",
                    }}
                >
                    היסטוריית מיקום נוכחי
                </DialogTitle>

                <DialogContent sx={{ px: 3, pb: 3 }}>
                    {activeLocationsHistory.length === 0 ? (
                        <Box
                            sx={{
                                py: 5,
                                textAlign: "center",
                                borderRadius: 4,
                                bgcolor: "#ffffff",
                                border: "1px dashed #cbd5e1",
                            }}
                        >
                            <Typography sx={{ fontWeight: 700, color: "#64748b" }}>
                                אין היסטוריית מיקומים להצגה
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                            {activeLocationsHistory.map((item, index) => (
                                <Box
                                    key={item.id}
                                    sx={{
                                        position: "relative",
                                        display: "flex",
                                        gap: 2,
                                        p: 2.25,
                                        borderRadius: 4,
                                        bgcolor: "#ffffff",
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.1)",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: "14px",
                                            bgcolor: item.ended_at ? "#e0f2fe" : "#dcfce7",
                                            color: item.ended_at ? "#0284c7" : "#16a34a",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 900,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {index + 1}
                                    </Box>

                                    <Box sx={{ flex: 1, textAlign: "right" }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                gap: 1,
                                                alignItems: "center",
                                                mb: 1,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: 17,
                                                    color: "#0f172a",
                                                }}
                                            >
                                                {item.active_location}
                                            </Typography>

                                            <Box
                                                sx={{
                                                    px: 1.25,
                                                    py: 0.4,
                                                    borderRadius: 999,
                                                    fontSize: 12,
                                                    fontWeight: 800,
                                                    bgcolor: item.ended_at ? "#f1f5f9" : "#dcfce7",
                                                    color: item.ended_at ? "#64748b" : "#15803d",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {item.ended_at ? "הסתיים" : "פעיל עכשיו"}
                                            </Box>
                                        </Box>

                                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                                            התחיל: {new Date(item.started_at).toLocaleString("he-IL")}
                                        </Typography>

                                        <Typography variant="body2" sx={{ color: "#64748b" }}>
                                            הסתיים:{" "}
                                            {item.ended_at
                                                ? new Date(item.ended_at).toLocaleString("he-IL")
                                                : "עדיין פעיל"}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
            </Box>
        </Dialog>
    )
}

export default ActiveLocationHistory
