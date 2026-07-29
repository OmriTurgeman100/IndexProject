import { Typography, Box } from "@mui/material"
import { static_api_docs_endpoint } from "../services/Get_Visualization_Total"
import { useEffect, useState } from "react";


interface ApiEndpoint {
    base_url: string;
}

const Developers = () => {
    const [endpoint, setEndpoint] = useState<ApiEndpoint>()


    useEffect(() => {
        const fetch_endpoint = async () => {
            try {
                const response = await static_api_docs_endpoint()

                setEndpoint(response)

            } catch (error) {
                console.error(error)
            }
        }

        fetch_endpoint()
    }, [])


    return (
        <div>

            <Typography>Hey from developers page!</Typography>

            <Typography>{endpoint?.base_url}</Typography>
        </div>
    )
}

export default Developers
