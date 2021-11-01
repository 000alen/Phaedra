import "../../css/components/CellToolbarComponent.css";

import React, { useContext } from "react";

import { IconButton } from "@fluentui/react";

import { handleMoveDown, handleMoveUp } from "../../actions/CellToolbar";
import { NotebookController } from "../../contexts/NotebookController";

// import { CellToolbarProps } from "./ICellToolbarComponent";

const style = {
  width: 20,
  height: 20,
  color: "white",
};

export function CellToolbarComponent() {
  const notebookController = useContext(NotebookController);
  return (
    <div className="cellToolbarContainer bg-gray-400">
      <div className="cellToolbar flex align-middle p-0.5 rounded-sm bg-gray-400">
        <IconButton
          style={style}
          iconProps={{ iconName: "Up" }}
          onClick={() => handleMoveUp(notebookController)}
        />

        <IconButton
          style={style}
          iconProps={{ iconName: "Down" }}
          onClick={() => handleMoveDown(notebookController)}
        />

        <IconButton style={style} iconProps={{ iconName: "Cancel" }} />

        <IconButton style={style} iconProps={{ iconName: "CollapseMenu" }} />
      </div>
    </div>
  );
}
