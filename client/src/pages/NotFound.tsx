import NotFoundImage from "../assets/NotFoundImage.svg";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

export const NotFound = () => {
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
        onClick={() => navigate("/")}
        sx={{ position: "absolute", bottom: 0, right: 0 }}
      >
        חזור לדף הבית
      </Button>
      <img
        src={NotFoundImage}
        alt="Not Found"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};
