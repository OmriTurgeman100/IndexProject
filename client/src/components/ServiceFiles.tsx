import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Link,
    IconButton,
    TextField,
    Button
} from "@mui/material";

import { delete_service_file, display_service_files, upload_service_file } from "../services/Service";
import { useThemeContext } from "../hooks/useThemeContext";
import { Delete } from "@mui/icons-material";
import AddIcon from '@mui/icons-material/Add';

interface service_files {
    id: number
    service_id: number
    title: string
    filename: string
    created_at: string
    url: string
}

interface PropData {
    service_id: string | undefined;
    show_files: boolean;
    close_files: () => void;
}



export const ServiceFiles = ({ service_id, show_files, close_files }: PropData) => {
    const [files, setFiles] = useState<service_files[]>([])
    const { theme } = useThemeContext();
    const [showUpload, setShowUpload] = useState<boolean>(false)
    const [title, setTitle] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [refreshDelete, setRefreshDelete] = useState<boolean>(false);


    const load_files = async () => {
        try {
            const response = await display_service_files(service_id)

            setFiles(response.data)


        } catch (error) {
            console.error(error)
        }
    }

    const delete_file = async (file_id: number) => {
        try {
            await delete_service_file(file_id)

            setRefreshDelete((prev) => !prev)

        } catch (error) {
            console.error(error)
        }
    }


    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        await upload_service_file(service_id as string, file as File, title);

        load_files()

        setShowUpload(false);
    };

    useEffect(() => {
        load_files()

    }, [service_id, refreshDelete])

    return (

        <>

            {showUpload === false ? (

                <Dialog open={show_files} onClose={close_files}>


                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>


                        <IconButton sx={{ backgroundColor: theme.palette.primary.main }} onClick={() => setShowUpload(true)}>
                            <AddIcon />
                        </IconButton>

                        <Typography>
                            קבצים
                        </Typography>

                    </Box>


                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1, width: "500px" }}>
                        {files.map((item) => (

                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                                <Link
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener"
                                    sx={{ color: theme.palette.text.primary }}
                                >
                                    {item.title}
                                </Link>

                                <IconButton onClick={() => delete_file(item.id)}>
                                    <Delete />
                                </IconButton>

                            </Box>

                        ))}
                    </DialogContent>

                </Dialog>

            ) : (

                <Dialog open={showUpload} onClose={() => setShowUpload(false)}>
                    <DialogTitle sx={{ textAlign: "center" }}>העלאת קבצים </DialogTitle>
                    <form onSubmit={handleUpload}>
                        <DialogContent
                            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                        >
                            <TextField
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{ width: "400px" }}
                            />
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
                            <Button sx={{ color: theme.palette.text.primary }} onClick={() => setShowUpload(false)}>Cancel</Button>
                            <Button type="submit" variant="contained">
                                Upload
                            </Button>
                        </DialogActions>
                    </form>



                </Dialog>

            )}

        </>
    )
}
