import React from "react";
import { CommandBar, MessageBarType } from "@fluentui/react";
import { v4 as uuidv4 } from "uuid";

import {
  clipboardPush,
  clipboardTop,
} from "../../../manipulation/ClipboardManipulation";
import {
  createPage,
  createCell,
  indexPage,
  insertPage,
  indexCell,
  insertCell,
  removeCell,
  addQuestionCell,
  addGenerateCell,
  getCell,
} from "../../../manipulation/NotebookManipulation";

export default function HomeItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const handleSave = () => {
    const { notebookController } = notebookRef.current.state;
    notebookController.save();
  };

  const handleInsertPage = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;

    if (activePage) {
      const activePageIndex = notebookController.do(indexPage, {
        pageId: activePage,
      });
      notebookController.do(insertPage, {
        page: createPage({}),
        index: activePageIndex + 1,
      });
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const handleInsertCell = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage, activeCell } = notebookRef.current.state;
    if (activeCell) {
      const activeCellIndex = notebookController.do(indexCell, {
        pageId: activePage,
        cellId: activeCell,
      });
      notebookController.do(insertCell, {
        pageId: activePage,
        cell: createCell({}),
        index: activeCellIndex + 1,
      });
    } else {
      pageController.addMessageBar("No cell selected", MessageBarType.error);
    }
  };

  const handleDelete = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage, activeCell } = notebookRef.current.state;

    if (activeCell) {
      notebookController.do(removeCell, {
        pageId: activePage,
        cellId: activeCell,
      });
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const handleUndo = () => {
    const { notebookController } = notebookRef.current.state;
    notebookController.undo();
  };

  const handleRedo = () => {
    const { notebookController } = notebookRef.current.state;
    notebookController.redo();
  };

  const handleCut = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage, activeCell } = notebookRef.current.state;

    if (activeCell) {
      const cell = notebookController.do(getCell, {
        pageId: activePage,
        cellId: activeCell,
      });

      appController.clipboardDo(clipboardPush, { element: cell });

      notebookController.do(removeCell, {
        pageId: activePage,
        cellId: activeCell,
      });
    } else {
      pageController.addMessageBar("No cell selected", MessageBarType.error);
    }
  };

  const handleCopy = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage, activeCell } = notebookRef.current.state;

    if (activeCell) {
      const cell = notebookController.do(getCell, {
        pageId: activePage,
        cellId: activeCell,
      });

      appController.clipboardDo(clipboardPush, { element: cell });
    } else {
      pageController.addMessageBar("No cell selected", MessageBarType.error);
    }
  };

  const handlePaste = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage, activeCell } = notebookRef.current.state;
    if (activeCell) {
      const activeCellIndex = notebookController.do(indexCell, {
        pageId: activePage,
        cellId: activeCell,
      });

      let cell = { ...appController.clipboardDo(clipboardTop) };

      cell.id = uuidv4();
      notebookController.do(insertCell, {
        pageId: activePage,
        cell: cell,
        index: activeCellIndex + 1,
      });
    } else {
      pageController.addMessageBar("No cell selected", MessageBarType.error);
    }
  };

  const handleQuestion = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;
    if (activePage && commandBoxRef.current) {
      const { command } = commandBoxRef.current.state;
      notebookController.do(addQuestionCell, {
        question: command,
        pageId: activePage,
      });
      commandBoxRef.current.consume();
    } else if (activePage) {
      pageController.addMessageBar("No question", MessageBarType.error);
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const handleGenerate = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;
    if (activePage && commandBoxRef.current) {
      const { command } = commandBoxRef.current.state;
      notebookController.do(addGenerateCell, {
        prompt: command,
        pageId: activePage,
      });
      commandBoxRef.current.consume();
    } else if (activePage) {
      pageController.addMessageBar("No prompt", MessageBarType.error);
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const homeItems = [
    {
      key: "save",
      iconProps: { iconName: "Save" },
      onClick: handleSave,
    },
    {
      key: "insert",
      iconProps: { iconName: "Add" },
      subMenuProps: {
        items: [
          {
            key: "insertPage",
            text: "Insert Page",
            onClick: handleInsertPage,
          },
          {
            key: "insertCell",
            text: "Insert Cell",
            onClick: handleInsertCell,
          },
        ],
      },
    },
    {
      key: "delete",
      iconProps: { iconName: "Delete" },
      onClick: handleDelete,
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
            onClick: handleUndo,
          },
          {
            key: "redo",
            text: "Redo",
            iconProps: { iconName: "Redo" },
            onClick: handleRedo,
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
            onClick: handleCut,
          },
          {
            key: "copy",
            text: "Copy",
            iconProps: { iconName: "Copy" },
            onClick: handleCopy,
          },
          {
            key: "paste",
            text: "Paste",
            iconProps: { iconName: "Paste" },
            onClick: handlePaste,
          },
        ],
      },
    },
  ];

  const homeFarItems = [
    {
      key: "generate",
      iconProps: { iconName: "Processing" },
      onClick: handleGenerate,
    },
    {
      key: "question",
      iconProps: { iconName: "Search" },
      onClick: handleQuestion,
    },
  ];

  return <CommandBar items={homeItems} farItems={homeFarItems} />;
}
