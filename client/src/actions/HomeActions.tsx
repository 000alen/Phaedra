import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/INotebookPageController";
import { strings } from "../strings";
import {
  clipboardPush,
  makeCellUnique,
  makePageUnique,
} from "../structures/clipboard/ClipboardManipulation";
import { clipboardTop } from "../structures/clipboard/ClipboardQueries";
import { createMessage } from "../structures/messages/MessagesConstructors";
import { addMessage } from "../structures/messages/MessagesManipulation";
import { ICell, IPage } from "../structures/notebook/INotebookManipulation";
import {
  createCell,
  createPage,
} from "../structures/notebook/NotebookConstructors";
import {
  addCellSync,
  addGenerateCell,
  addPageSync,
  addQuestionCell,
  insertCellSync,
  insertPageSync,
  removeCellSync,
  removePageSync,
} from "../structures/notebook/NotebookManipulation";
import {
  getCell,
  getPage,
  indexCell,
  indexPage,
  isCell,
  isPage,
} from "../structures/notebook/NotebookQueries";

export function handleSave(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;

  notebookController.save();
}

export function handleInsertPage(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const activePage = notebookController.getActivePage();

  if (activePage) {
    const activePageIndex = indexPage(notebook, activePage);
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
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    const activeCellIndex = indexCell(notebook, activePage, activeCell);
    notebookController.doSync(insertCellSync, {
      pageId: activePage,
      cell: createCell({}),
      index: activeCellIndex + 1,
    });
  } else if (activePage) {
    notebookController.doSync(addCellSync, {
      pageId: activePage,
      cell: createCell({}),
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

export function handleDelete(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    notebookController.doSync(removeCellSync, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage) {
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
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    const cell = getCell(notebook, activePage, activeCell);
    appController.clipboardDo(clipboardPush, { element: cell! });
    notebookController.doSync(removeCellSync, {
      pageId: activePage,
      cellId: activeCell,
    });
  } else if (activePage) {
    const page = getPage(notebook, activePage);
    appController.clipboardDo(clipboardPush, { element: page! });
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

export function handleCopy(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const notebook = notebookController.getNotebook()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (activeCell) {
    const cell = getCell(notebook, activePage, activeCell);
    appController.clipboardDo(clipboardPush, { element: cell! });
  } else if (activePage) {
    const page = getPage(notebook, activePage);
    appController.clipboardDo(clipboardPush, { element: page! });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}

export function handlePaste(notebookPageController: INotebookPageController) {
  const appController = notebookPageController.getAppController()!;
  const notebookController = notebookPageController.getNotebookController()!;
  const top = clipboardTop(appController.getClipboard()!);
  const notebook = notebookController.getNotebook()!;
  const activeCell = notebookController.getActiveCell()!;
  const activePage = notebookController.getActivePage()!;

  if (isCell(top)) {
    const cell = makeCellUnique(top as ICell);
    if (activeCell) {
      const index = indexCell(notebook, activePage, activeCell) + 1;
      notebookController.doSync(insertCellSync, {
        pageId: activePage,
        cell: cell,
        index,
      });
    } else if (activePage) {
      notebookController.doSync(addCellSync, {
        pageId: activePage,
        cell: cell,
      });
    } else {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          type: MessageBarType.error,
          text: strings.noActiveCellOrPage,
        }),
      });
    }
  } else if (isPage(top)) {
    const page = makePageUnique(top as IPage);
    if (activePage) {
      const index = indexPage(notebook, activePage) + 1;
      notebookController.doSync(insertPageSync, {
        page: page,
        index,
      });
    } else {
      notebookPageController.messagesDo(addMessage, {
        message: createMessage({
          type: MessageBarType.error,
          text: strings.noActiveCellOrPage,
        }),
      });
    }
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.unknownError,
      }),
    });
  }
}

export function handleQuestion(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

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
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

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
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noActiveCellOrPage,
      }),
    });
  }
}
