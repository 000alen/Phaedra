import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleExport } from "../../../actions/ViewActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

export default function ViewItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const viewItems = [
    {
      key: "export",
      name: "Export",
      iconProps: { iconName: "Export" },
      onClick: () => handleExport(notebookPageController),
    },
  ];

  return <CommandBar items={viewItems} />;
}
