import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <ThemeProvider>
    <BrowserRouter>
      <SupabaseAuthProvider>
        <App />
      </SupabaseAuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  // </StrictMode>,
);
