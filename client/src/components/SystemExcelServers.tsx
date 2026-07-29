import { useState } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";
import { upload_system_servers_excel } from "../services/System";
import CircularProgress from "@mui/material/CircularProgress";
import { useThemeContext } from "../hooks/useThemeContext";



interface PropData {
    system_id: string | undefined;
    show_upload: boolean;
    close_upload: () => void;
    refresh: () => void
    open_servers: () => void
}

export const SystemExcelServers = ({ system_id, show_upload, close_upload, refresh, open_servers }: PropData) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { theme } = useThemeContext();

    const handleUpload = async (e: React.FormEvent) => {
        setLoading(true)
        e.preventDefault();
        await upload_system_servers_excel(system_id as string, file as File);

        setLoading(false)

        refresh()

        open_servers()

        close_upload()

    };

    return (
        <Dialog open={show_upload} onClose={close_upload}>

            <DialogTitle>
                העלאת שרתים מאקסל
            </DialogTitle>


            {loading === false ? (
                <form onSubmit={handleUpload}>
                    <DialogContent
                        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                        <Button variant="outlined" component="label" sx={{ color: theme.palette.text.primary }}>
                            בחר קובץ
                            <input
                                type="file"
                                hidden
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </Button>
                        {file && <Typography variant="body2">{file.name}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ color: theme.palette.text.primary }} onClick={close_upload}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Upload
                        </Button>
                    </DialogActions>
                </form>
            ) :
                (

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100px"
                        }}
                    >
                        <CircularProgress sx={{ color: "#007FFF" }} />
                    </Box>

                )}

        </Dialog>
    )
}
