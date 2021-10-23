import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleTest } from "../../../actions/FileActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

export default function FileItems() {
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
