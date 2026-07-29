import forbidden from "../assets/forbidden.svg";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

export const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Button
        variant="outlined"
        onClick={() => navigate("/")}
        sx={{
          position: "absolute",
          bottom: "28%",
          right: "29%",
          fontSize: "22px",
          width: "300px",
          color: "#017EFF",
          borderRadius: 5,
        }}
      >
        חזור לדף הבית
      </Button>
      <img
        src={forbidden}
        alt="Forbidden"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};
