import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// borramos la línea de index.css que causaba el error
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);