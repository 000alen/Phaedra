import React from "react";
import { CommandBar } from "@fluentui/react";
import { handleTest } from "../../../actions/FileActions";

export default function FileItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
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
