import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";

interface SearchNavbarProps {
    keyword: string;
    totalMatches: number;
    currentMatch: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

export const SearchNavbar = ({
    keyword,
    totalMatches,
    currentMatch,
    onNext,
    onPrev,
    onClose,
}: SearchNavbarProps) => (
    <Box
        sx={{
            position: "fixed",
            top: 72,
            right: 130,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.25,
            py: 0.5,
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 6px rgba(0,0,0,0.07)",
            userSelect: "none",
        }}
    >
        <Typography
            noWrap
            sx={{ fontSize: 13, color: "#374151", maxWidth: 180, px: 0.5 }}
        >
            {keyword}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(0,0,0,0.1)" }} />

        <Typography
            sx={{
                fontSize: 12,
                fontWeight: 500,
                color: totalMatches > 0 ? "#6b7280" : "#ef4444",
                minWidth: 52,
                textAlign: "center",
                px: 0.25,
            }}
        >
            {totalMatches === 0 ? "No results" : `${currentMatch} / ${totalMatches}`}
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(0,0,0,0.1)" }} />

        <Tooltip title="Previous (Shift+F3)" placement="bottom">
            <span>
                <IconButton
                    size="small"
                    onClick={onPrev}
                    disabled={totalMatches === 0}
                    sx={{
                        width: 28, height: 28,
                        color: "#6b7280",
                        borderRadius: "6px",
                        "&:hover": { backgroundColor: "#f3f4f6", color: "#2563eb" },
                        "&.Mui-disabled": { color: "#d1d5db" },
                        transition: "all 0.15s ease",
                    }}
                >
                    <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </span>
        </Tooltip>

        <Tooltip title="Next (F3)" placement="bottom">
            <span>
                <IconButton
                    size="small"
                    onClick={onNext}
                    disabled={totalMatches === 0}
                    sx={{
                        width: 28, height: 28,
                        color: "#6b7280",
                        borderRadius: "6px",
                        "&:hover": { backgroundColor: "#f3f4f6", color: "#2563eb" },
                        "&.Mui-disabled": { color: "#d1d5db" },
                        transition: "all 0.15s ease",
                    }}
                >
                    <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(0,0,0,0.1)" }} />

        <Tooltip title="Close (Esc)" placement="bottom">
            <IconButton
                size="small"
                onClick={onClose}
                sx={{
                    width: 28, height: 28,
                    color: "#9ca3af",
                    borderRadius: "6px",
                    "&:hover": { backgroundColor: "#fee2e2", color: "#ef4444" },
                    transition: "all 0.15s ease",
                }}
            >
                <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
        </Tooltip>
    </Box>
);
