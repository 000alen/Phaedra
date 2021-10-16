import React from "react";
import { CommandBar } from "@fluentui/react";
import { handleSeamless, handleEdit } from "../../../actions/EditAction";

export default function EditItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const editItems = [
    {
      key: "Seamless",
      iconProps: { iconName: "AlignLeft" },
      onClick: () => handleSeamless(notebookRef),
    },
  ];

  const editFarItems = [
    {
      key: "edit",
      iconProps: { iconName: "Edit" },
      onClick: () => handleEdit(notebookRef),
    },
  ];

  return <CommandBar items={editItems} farItems={editFarItems} />;
}
