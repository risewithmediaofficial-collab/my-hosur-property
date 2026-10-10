import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { i18nReady } from "./i18n/i18n";
import App from "./App";
import "./index.css";
import "./styles/responsive-ui.css";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

// Render after the saved language is available to avoid a language flash.
i18nReady.then(() => createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>
));
