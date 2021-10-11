import React from "react";
import { CommandBar } from "@fluentui/react";

function EditItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const handleSeamless = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage, activeCell } = notebookRef.current.state;

    notebookController.setCellData(activePage, activeCell, { seamless: true });
  };

  const handleEdit = () => {
    const { notebookController } = notebookRef.current.state;
    notebookController.toggleEditing();
  };

  const editItems = [
    {
      key: "Seamless",
      iconProps: { iconName: "AlignLeft" },
      onClick: handleSeamless,
    },
  ];

  const editFarItems = [
    {
      key: "edit",
      iconProps: { iconName: "Edit" },
      onClick: handleEdit,
    },
  ];

  return <CommandBar items={editItems} farItems={editFarItems} />;
}

export default EditItems;