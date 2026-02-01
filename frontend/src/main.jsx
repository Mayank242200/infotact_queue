import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import AuthProvider from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* AuthProvider must wrap SocketProvider so socket has user info */}
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
