import React from "react";

import { CommandBar } from "@fluentui/react";

import {
  handleCopy,
  handleCut,
  handleDelete,
  handleGenerate,
  handleInsertCell,
  handleInsertPage,
  handlePaste,
  handleQuestion,
  handleRedo,
  handleSave,
  handleUndo,
} from "../../../actions/HomeActions";
import { NotebookPageController } from "../../../contexts/NotebookPageController";

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
            text: "Undo",
            iconProps: { iconName: "Undo" },
            onClick: () => handleUndo(notebookPageController),
          },
          {
            key: "redo",
            text: "Redo",
            iconProps: { iconName: "Redo" },
            onClick: () => handleRedo(notebookPageController),
          },
        ],
      },
    },
    {
      key: "clipboard",
      iconProps: { iconName: "ClipboardSolid" },
      subMenuProps: {
        items: [
          {
            key: "cut",
            text: "Cut",
            iconProps: { iconName: "Cut" },
            onClick: () => handleCut(notebookPageController),
          },
          {
            key: "copy",
            text: "Copy",
            iconProps: { iconName: "Copy" },
            onClick: () => handleCopy(notebookPageController),
          },
          {
            key: "paste",
            text: "Paste",
            iconProps: { iconName: "Paste" },
            onClick: () => handlePaste(notebookPageController),
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
