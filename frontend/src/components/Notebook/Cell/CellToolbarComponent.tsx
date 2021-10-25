import "../../../css/components/CellToolbarComponent.css";

import React from "react";

import { IconButton } from "@fluentui/react";

import { CellToolbarProps } from "./ICellToolbarComponent";

export function CellToolbarComponent() {
  return (
    <div className="cellToolbarContainer bg-gray-400">
      <div className="cellToolbar flex align-middle rounded-sm bg-gray-400">
        <IconButton iconProps={{ iconName: "Cancel" }} />
        <IconButton iconProps={{ iconName: "Cancel" }} />
        <IconButton iconProps={{ iconName: "Cancel" }} />
      </div>
    </div>
  );
}
