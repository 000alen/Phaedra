import React from "react";
import { CommandBar } from "@fluentui/react";
import {
  handleSave,
  handleInsertPage,
  handleInsertCell,
  handleDelete,
  handleUndo,
  handleRedo,
  handleCut,
  handleCopy,
  handlePaste,
  handleGenerate,
  handleQuestion,
} from "../../../actions/HomeActions";

export default function HomeItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const homeItems = [
    {
      key: "save",
      iconProps: { iconName: "Save" },
      onClick: () => handleSave(notebookRef),
    },
    {
      key: "insert",
      iconProps: { iconName: "Add" },
      subMenuProps: {
        items: [
          {
            key: "insertPage",
            text: "Insert Page",
            onClick: () => handleInsertPage(notebookRef, pageController),
          },
          {
            key: "insertCell",
            text: "Insert Cell",
            onClick: () => handleInsertCell(notebookRef, pageController),
          },
        ],
      },
    },
    {
      key: "delete",
      iconProps: { iconName: "Delete" },
      onClick: () => handleDelete(notebookRef, pageController),
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
            onClick: () => handleUndo(notebookRef),
          },
          {
            key: "redo",
            text: "Redo",
            iconProps: { iconName: "Redo" },
            onClick: () => handleRedo(notebookRef),
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
            onClick: () =>
              handleCut(notebookRef, pageController, appController),
          },
          {
            key: "copy",
            text: "Copy",
            iconProps: { iconName: "Copy" },
            onClick: () =>
              handleCopy(notebookRef, pageController, appController),
          },
          {
            key: "paste",
            text: "Paste",
            iconProps: { iconName: "Paste" },
            onClick: () =>
              handlePaste(notebookRef, pageController, appController),
          },
        ],
      },
    },
  ];

  const homeFarItems = [
    {
      key: "generate",
      iconProps: { iconName: "Processing" },
      onClick: () => handleGenerate(notebookRef, commandBoxRef, pageController),
    },
    {
      key: "question",
      iconProps: { iconName: "Search" },
      onClick: () => handleQuestion(notebookRef, commandBoxRef, pageController),
    },
  ];

  return <CommandBar items={homeItems} farItems={homeFarItems} />;
}
