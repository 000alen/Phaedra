import { MessageBarType } from "@fluentui/react";

import { INotebookPageController } from "../contexts/INotebookPageController";
import { strings } from "../strings";
import { createMessage } from "../structures/messages/MessagesConstructors";
import { addMessage } from "../structures/messages/MessagesManipulation";
import {
  addEntitiesCell,
  addWikipediaImageCell,
  addWikipediaSuggestionsCell,
  addWikipediaSummaryCell,
} from "../structures/notebook/NotebookManipulation";

export function handleWikipediaSummary(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage, activeCell] = notebookController.getActive();

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

export function handleWikipediaSuggestions(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage, activeCell] = notebookController.getActive();

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

export function handleWikipediaImage(
  notebookPageController: INotebookPageController
) {
  const notebookController = notebookPageController.getNotebookController()!;
  const commandBoxRef = notebookPageController.getCommandBoxRef()!;

  const [activePage, activeCell] = notebookController.getActive();

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

  const [activePage, activeCell] = notebookController.getActive();

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
