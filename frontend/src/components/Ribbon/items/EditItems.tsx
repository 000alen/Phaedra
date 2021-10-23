import React from "react";

import { CommandBar } from "@fluentui/react";

import { handleEdit, handleSeamless } from "../../../actions/EditAction";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { RibbonItemsProps } from "../IRibbonComponent";

export default function EditItems({}: RibbonItemsProps) {
  const notebookPageController = React.useContext(NotebookPageController);

  const editItems = [
    {
      key: "Seamless",
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
