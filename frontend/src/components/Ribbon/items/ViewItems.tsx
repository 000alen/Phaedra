import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleExport } from "../../../actions/ViewActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { RibbonItemsProps } from "../IRibbonComponent";

export default function ViewItems({}: RibbonItemsProps) {
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
