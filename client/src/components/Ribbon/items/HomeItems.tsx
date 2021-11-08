import React from "react";

import { CommandBar } from "@fluentui/react";

import { saveAction } from "../../../actions/HomeActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

export default function HomeItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const homeItems = [
    {
      key: "save",
      iconProps: { iconName: "Save" },
      onClick: () => saveAction(notebookPageController),
    },
  ];

  return <CommandBar items={homeItems} />;
}
