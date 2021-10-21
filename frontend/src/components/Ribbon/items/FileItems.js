import React from "react";
import { CommandBar } from "@fluentui/react";
import { handleTest } from "../../../actions/FileActions";
import { NotebookPageController } from "../../../pages/NotebookPage/NotebookPageController";

export default function FileItems() {
  const notebookPageController = React.useContext(NotebookPageController);
  const notebookRef = notebookPageController.getNotebookRef();

  const fileItems = [
    {
      key: "test",
      name: "Test",
      iconProps: {
        iconName: "TestCase",
      },
      onClick: () => handleTest(notebookRef),
    },
  ];

  return <CommandBar items={fileItems} />;
}
