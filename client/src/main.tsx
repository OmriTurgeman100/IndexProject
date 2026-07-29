import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProviderComponent } from "./context/ThemeContext.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProviderComponent>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProviderComponent>
  </StrictMode>
);
