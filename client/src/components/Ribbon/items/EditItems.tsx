import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleEdit, handleSeamless } from "../../../actions/EditActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

export default function EditItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const editItems = [
    {
      key: "seamless",
      iconProps: { iconName: "AlignLeft" },
      onClick: () => handleSeamless(notebookPageController),
    },
  ];

  const editFarItems = [
    {
      key: "edit",
      iconProps: { iconName: "Edit" },
      onClick: () => handleEdit(notebookPageController),
    },
  ];

  return <CommandBar items={editItems} farItems={editFarItems} />;
}
