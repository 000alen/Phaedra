import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/NotebookPageController";
import { strings } from "../resources/strings";
import { addMessage, createMessage } from "../structures/MessagesStructure";
import {
  addEntitiesCell,
  addImageCell,
  addSuggestionsCell,
  addSummaryCell,
} from "../structures/NotebookStructure";

export function handleSummary(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage] = notebookController.getActive();

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addSummaryCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noQuery,
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

export function handleSuggestions(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage] = notebookController.getActive();

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addSuggestionsCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noQuery,
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

export function handleImage(notebookPageController: INotebookPageController) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage] = notebookController.getActive();

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addImageCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.messagesDo(addMessage, {
      message: createMessage({
        type: MessageBarType.error,
        text: strings.noQuery,
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

export function handleEntities(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;

  const [activePage] = notebookController.getActive();

  if (activePage) {
    notebookController.do(addEntitiesCell, { pageId: activePage });
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
