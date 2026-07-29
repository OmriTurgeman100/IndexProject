import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Link,
} from "@mui/material";
import { display_service_files } from "../services/Service";
import { useThemeContext } from "../hooks/useThemeContext";


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



export const ViewServiceFiles = ({ service_id, show_files, close_files }: PropData) => {
    const [files, setFiles] = useState<service_files[]>([])
    const { theme } = useThemeContext();



    const load_files = async () => {
        try {
            const response = await display_service_files(service_id)

            setFiles(response.data)


        } catch (error) {
            console.error(error)
        }
    }


    useEffect(() => {
        load_files()

    }, [service_id])

    return (


        <Dialog open={show_files} onClose={close_files}>

            <DialogTitle sx={{ textAlign: "center" }}>
                קבצים
            </DialogTitle>

            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1, width: "500px" }}>
                {files.map((item) => (

                    <Link
                        href={item.url}
                        target="_blank"
                        rel="noopener"
                        sx={{ color: theme.palette.text.primary }}
                    >
                        {item.title}
                    </Link>

                ))}
            </DialogContent>

        </Dialog>

    )
}
