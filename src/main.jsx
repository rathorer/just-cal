import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './assets/index.css'
import NewApp from "./NewApp";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserSettingsProvider>
      <App />
    </UserSettingsProvider>
  </React.StrictMode>,
);