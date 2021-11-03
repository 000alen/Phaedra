import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/NotebookPageController";
import { strings } from "../resources/strings";
import {
  clipboardPush,
  clipboardTop,
  makeCellUnique,
  makePageUnique,
} from "../structures/ClipboardStructure";
import { addMessage, createMessage } from "../structures/MessagesStructure";
import {
  addCellSync,
  addGenerateCell,
  addPageSync,
  addQuestionCell,
  createCell,
  createPage,
  getCell,
  getPage,
  ICell,
  indexCell,
  indexPage,
  insertCellSync,
  insertPageSync,
  IPage,
  isCell,
  isPage,
  removeCellSync,
  removePageSync,
} from "../structures/NotebookStructure";

export function handleSave(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;

  notebookController.save();
}

export function handleInsertPage(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook();

  const [activePage, activeCell] = notebookController.getActive();

  if (activePage) {
    const activePageIndex = indexPage(notebook!, activePage);
    notebookController.doSync(insertPageSync, {
      page: createPage({}),
      index: activePageIndex + 1,
    });
  } else {
    notebookController.doSync(addPageSync, {
      page: createPage({}),
    });
  }
}

export function handleInsertCell(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;

  const [activePage, activeCell] = notebookController.getActive();

  if (activeCell !== undefined) {
    const activeCellIndex = indexCell(notebook, activePage!, activeCell!);
    notebookController.doSync(insertCellSync, {
      pageId: activePage,
      cell: createCell({}),
      index: activeCellIndex + 1,
    });
  } else if (activePage !== undefined) {
    notebookController.doSync(addCellSync, {
      pageId: activePage,
      cell: createCell({}),
    });
  } else {
    // TODO: Select page on viewport
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleDelete(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const [activePage, activeCell] = notebookController.getActive();

  if (activeCell !== undefined) {
    notebookController.doSync(removeCellSync, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage !== undefined) {
    notebookController.doSync(removePageSync, {
      pageId: activePage,
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleUndo(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  notebookController.undo();
}

export function handleRedo(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  notebookController.redo();
}

export function handleCut(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const [activePage, activeCell] = notebookController.getActive();

  if (activeCell !== undefined) {
    const cell = getCell(notebook, activePage!, activeCell!);
    appController.clipboardDo(clipboardPush, { element: cell! });
    notebookController.doSync(removeCellSync, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage !== undefined) {
    const page = getPage(notebook, activePage);
    appController.clipboardDo(clipboardPush, { element: page! });
    notebookController.doSync(removePageSync, {
      pageId: activePage,
    });
  } else {
    // notebookPageController.messagesDo(addMessage, {
    //   message: createMessage({
    //     type: MessageBarType.error,
    //     text: strings.noActiveCellOrPage,
    //   }),
    // });
  }
}

export function handleCopy(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;

  const [activePage, activeCell] = notebookController.getActive();

  if (activeCell !== undefined) {
    const cell = getCell(notebook, activePage!, activeCell!);
    appController.clipboardDo(clipboardPush, { element: cell! });
  } else if (activePage) {
    const page = getPage(notebook, activePage);
    appController.clipboardDo(clipboardPush, { element: page! });
  } else {
    // notebookPageController.messagesDo(addMessage, {
    //   message: createMessage({
    //     type: MessageBarType.error,
    //     text: strings.noActiveCellOrPage,
    //   }),
    // });
  }
}

export function handlePaste(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const top = clipboardTop(appController.getClipboard()!);
  const notebook = notebookController.getNotebook()!;

  const [activePage, activeCell] = notebookController.getActive();

  if (isCell(top)) {
    const cell = makeCellUnique(top as ICell);
    if (activeCell !== undefined) {
      const index = indexCell(notebook, activePage!, activeCell!) + 1;
      notebookController.doSync(insertCellSync, {
        pageId: activePage,
        cell: cell,
        index,
      });
    } else if (activePage !== undefined) {
      notebookController.doSync(addCellSync, {
        pageId: activePage,
        cell: cell,
      });
    } else {
      // TODO: Select page on viewport
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          type: MessageBarType.error,
          text: strings.noActiveCellOrPage,
        }),
      });
    }
  } else if (isPage(top)) {
    const page = makePageUnique(top as IPage);
    if (activePage !== undefined) {
      const index = indexPage(notebook, activePage) + 1;
      notebookController.doSync(insertPageSync, {
        page: page,
        index,
      });
    } else {
      // TODO: Select page on viewport
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          type: MessageBarType.error,
          text: strings.noActiveCellOrPage,
        }),
      });
    }
  } else {
    throw new Error("Unreachable");
    // notebookPageController.messagesDo(addMessage, {
    //   message: createMessage({
    //     type: MessageBarType.error,
    //     text: strings.unknownError,
    //   }),
    // });
  }
}

export function handleQuestion(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage, activeCell] = notebookController.getActive();

  if (activePage && commandBoxRef!.current) {
    const { command } = commandBoxRef!.current.state;
    notebookController.do(addQuestionCell, {
      question: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noQuestion,
      }),
    });
  } else {
    // TODO: Select page on viewport
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handleGenerate(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage, activeCell] = notebookController.getActive();

  if (activePage && commandBoxRef!.current) {
    const { command } = commandBoxRef!.current.state;
    notebookController.do(addGenerateCell, {
      prompt: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noPrompt,
      }),
    });
  } else {
    // TODO: Select page on viewport
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}
