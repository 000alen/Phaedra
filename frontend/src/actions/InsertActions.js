import { MessageBarType } from "@fluentui/react";

import {
  addWikipediaSummaryCell,
  addWikipediaSuggestionsCell,
  addWikipediaImageCell,
  addEntitiesCell,
} from "../manipulation/NotebookManipulation";

export function handleWikipediaSummary(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookRef.current.do(addWikipediaSummaryCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.addMessageBar(
      "No query selected",
      MessageBarType.error
    );
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}

export function handleWikipediaSuggestions(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const { activePage } = notebookRef.current.state;
  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookRef.current.do(addWikipediaSuggestionsCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.addMessageBar(
      "No query selected",
      MessageBarType.error
    );
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}

export function handleWikipediaImage(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const { activePage } = notebookRef.current.state;
  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookRef.current.do(addWikipediaImageCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    notebookPageController.addMessageBar(
      "No query selected",
      MessageBarType.error
    );
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}

export function handleEntities(notebookPageController) {
  const notebookRef = notebookPageController.getNotebookRef();

  const { activePage } = notebookRef.current.state;

  if (activePage) {
    notebookRef.current.do(addEntitiesCell, { pageId: activePage });
  } else {
    notebookPageController.addMessageBar(
      "No page selected",
      MessageBarType.error
    );
  }
}
