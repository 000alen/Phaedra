import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleExport } from "../../../actions/ViewActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { strings } from "../../../resources/strings";

export default function ViewItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const viewItems = [
    {
      key: "export",
      text: strings.exportButtonLabel,
      iconProps: { iconName: "Export" },
      onClick: () => handleExport(notebookPageController),
    },
  ];

  return <CommandBar items={viewItems} />;
}
