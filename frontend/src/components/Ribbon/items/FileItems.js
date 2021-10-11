import React from "react";
import { CommandBar, MessageBarType } from "@fluentui/react";

function FileItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const handleTest = () => {};

  const fileItems = [
    {
      key: "test",
      name: "Test",
      iconProps: {
        iconName: "TestCase",
      },
      onClick: handleTest,
    },
  ];

  return <CommandBar items={fileItems} />;
}

export default FileItems;
