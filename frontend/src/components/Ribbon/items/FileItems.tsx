import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleTest } from "../../../actions/FileActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { RibbonItemsProps } from "../IRibbonComponent";

export default function FileItems({}: RibbonItemsProps) {
  const notebookPageController = React.useContext(NotebookPageController);

  const fileItems = [
    {
      key: "test",
      name: "Test",
      iconProps: {
        iconName: "TestCase",
      },
      onClick: () => handleTest(notebookPageController),
    },
  ];

  return <CommandBar items={fileItems} />;
}
