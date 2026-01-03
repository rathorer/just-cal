import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './assets/index.css'
import NewApp from "./NewApp";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NewApp />
  </React.StrictMode>,
);