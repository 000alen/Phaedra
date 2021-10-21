import React from "react";
import { CommandBar } from "@fluentui/react";
import { handleExport } from "../../../actions/ViewActions";
import { NotebookPageController } from "../../../pages/NotebookPage/NotebookPageController";

export default function ViewItems() {
  const notebookPageController = React.useContext(NotebookPageController);
  const notebookRef = notebookPageController.getNotebookRef();

  const viewItems = [
    {
      key: "export",
      name: "Export",
      iconProps: { iconName: "Export" },
      onClick: () => handleExport(notebookRef),
    },
  ];

  return <CommandBar items={viewItems} />;
}
