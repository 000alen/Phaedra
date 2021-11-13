import "./css/index.css";

import React from "react";
import ReactDOM from "react-dom";

import { initializeIcons, ThemeProvider } from "@fluentui/react";

import { App } from "./App";
import { theme } from "./resources/theme";

export const { ipcRenderer } = window.require("electron");

initializeIcons();

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
