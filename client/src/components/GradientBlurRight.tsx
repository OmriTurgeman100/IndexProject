import { Box } from "@mui/material";

interface PositionTypes {
    right_position: string
    top_position: string
}

export const GradientBlurRight = ({ right_position, top_position }: PositionTypes) => {
    return (
        <Box
            sx={{
                background:
                    "radial-gradient(circle, rgba(76,98,255,0.4) 0%, rgba(0,0,0,0) 70%)",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                position: "fixed",
                right: right_position, // * 10px is the default value
                top: top_position, // * 100px is the default value
                filter: "blur(100px)",
                zIndex: -1,
            }}
        />
    )
}
