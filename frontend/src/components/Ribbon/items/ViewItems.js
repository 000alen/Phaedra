import React from "react";
import { CommandBar } from "@fluentui/react";
import { handleExport } from "../actions/ViewActions";

export default function ViewItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
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
