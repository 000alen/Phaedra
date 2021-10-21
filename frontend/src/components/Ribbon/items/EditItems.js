import React from "react";
import { CommandBar } from "@fluentui/react";
import { handleSeamless, handleEdit } from "../../../actions/EditAction";
import { NotebookPageController } from "../../../pages/NotebookPage/NotebookPageController";

export default function EditItems() {
  const notebookPageController = React.useContext(NotebookPageController);
  const notebookRef = notebookPageController.getNotebookRef();

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
