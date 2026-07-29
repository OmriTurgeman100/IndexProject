import { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Link,
} from "@mui/material";
import { display_system_files } from "../services/System";
import { useThemeContext } from "../hooks/useThemeContext";


interface system_files {
    id: number
    system_id: number
    title: string
    filename: string
    created_at: string
    url: string
}

interface PropData {
    system_id: string | undefined;
    show_files: boolean;
    close_files: () => void;
}



export const ViewSystemFiles = ({ system_id, show_files, close_files }: PropData) => {
    const [files, setFiles] = useState<system_files[]>([])
    const { theme } = useThemeContext();



    const load_files = async () => {
        try {
            const response = await display_system_files(system_id)

            setFiles(response.data)


        } catch (error) {
            console.error(error)
        }
    }


    useEffect(() => {
        load_files()

    }, [system_id])

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
