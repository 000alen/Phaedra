import { CommandBar, MessageBarType } from "@fluentui/react";

import {
  addWikipediaSummaryCell,
  addWikipediaSuggestionsCell,
  addWikipediaImageCell,
  addEntitiesCell,
} from "../manipulation/NotebookManipulation";

export function handleWikipediaSummary(
  notebookRef,
  commandBoxRef,
  pageController
) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addWikipediaSummaryCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No query selected", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleWikipediaSuggestions(
  notebookRef,
  commandBoxRef,
  pageController
) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addWikipediaSuggestionsCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No query selected", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleWikipediaImage(
  notebookRef,
  commandBoxRef,
  pageController
) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage && commandBoxRef.current) {
    const { command } = commandBoxRef.current.state;
    notebookController.do(addWikipediaImageCell, {
      query: command,
      pageId: activePage,
    });
    commandBoxRef.current.consume();
  } else if (activePage) {
    pageController.addMessageBar("No query selected", MessageBarType.error);
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}

export function handleEntities(notebookRef, pageController) {
  const { notebookController } = notebookRef.current.state;
  const { activePage } = notebookRef.current.state;

  if (activePage) {
    notebookController.do(addEntitiesCell, { pageId: activePage });
  } else {
    pageController.addMessageBar("No page selected", MessageBarType.error);
  }
}
