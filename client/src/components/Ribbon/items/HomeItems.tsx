import React from "react";

import { CommandBar } from "@fluentui/react";

import {
  handleDelete,
  handleGenerate,
  handleInsertCell,
  handleInsertPage,
  handleQuestion,
  handleRedo,
  handleSave,
  handleUndo,
} from "../../../actions/HomeActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";
import { strings } from "../../../resources/strings";

export default function HomeItems() {
  const notebookPageController = React.useContext(NotebookPageController);

  const homeItems = [
    {
      key: "save",
      iconProps: { iconName: "Save" },
      onClick: () => handleSave(notebookPageController),
    },
    {
      key: "insert",
      iconProps: { iconName: "Add" },
      subMenuProps: {
        items: [
          {
            key: "insertPage",
            text: "Insert Page",
            onClick: () => handleInsertPage(notebookPageController),
          },
          {
            key: "insertCell",
            text: "Insert Cell",
            onClick: () => {
              handleInsertCell(notebookPageController);
            },
          },
        ],
      },
    },
    {
      key: "delete",
      iconProps: { iconName: "Delete" },
      onClick: () => handleDelete(notebookPageController),
    },
    {
      key: "history",
      iconProps: { iconName: "History" },
      subMenuProps: {
        items: [
          {
            key: "undo",
            text: strings.undoButtonLabel,
            iconProps: { iconName: "Undo" },
            onClick: () => handleUndo(notebookPageController),
          },
          {
            key: "redo",
            text: strings.redoButtonLabel,
            iconProps: { iconName: "Redo" },
            onClick: () => handleRedo(notebookPageController),
          },
        ],
      },
    },
  ];

  const homeFarItems = [
    {
      key: "generate",
      iconProps: { iconName: "Processing" },
      onClick: () => handleGenerate(notebookPageController),
    },
    {
      key: "question",
      iconProps: { iconName: "Search" },
      onClick: () => handleQuestion(notebookPageController),
    },
  ];

  return <CommandBar items={homeItems} farItems={homeFarItems} />;
}
