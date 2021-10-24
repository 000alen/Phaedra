import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/INotebookPageController";
import {
  addMessage,
  createMessage,
} from "../manipulation/MessagesManipulation";
import {
  addEntitiesCell,
  addWikipediaImageCell,
  addWikipediaSuggestionsCell,
  addWikipediaSummaryCell,
} from "../manipulation/NotebookManipulation";

export function handleWikipediaSummary(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addWikipediaSummaryCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No query",
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}

export function handleWikipediaSuggestions(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addWikipediaSuggestionsCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No query",
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}

export function handleWikipediaImage(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addWikipediaImageCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No query",
      }),
    });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}

export function handleEntities(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const activePage = notebookController.getActivePage()!;

  if (activePage) {
    notebookController.do(addEntitiesCell, { pageId: activePage });
  } else {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: "No active page or cell",
      }),
    });
  }
}
