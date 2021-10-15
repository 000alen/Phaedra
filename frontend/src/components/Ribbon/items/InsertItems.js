import React from "react";
import { CommandBar, MessageBarType } from "@fluentui/react";

import {
  addWikipediaSummaryCell,
  addWikipediaSuggestionsCell,
  addWikipediaImageCell,
  addEntitiesCell,
} from "../../../manipulation/NotebookManipulation";

export default function InsertItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const handleWikipediaSummary = () => {
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
  };

  const handleWikipediaSuggestions = () => {
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
  };

  const handleWikipediaImage = () => {
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
  };

  const handleEntities = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;

    if (activePage) {
      notebookController.do(addEntitiesCell, { pageId: activePage });
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const insertItems = [
    {
      key: "entities",
      text: "Entities",
      iconProps: { iconName: "People" },
      onClick: handleEntities,
    },
    {
      key: "wikipedia",
      text: "Wikipedia",
      iconProps: { iconName: "Articles" },
      subMenuProps: {
        items: [
          {
            key: "wikipediaSummary",
            text: "Wikipedia Summary",
            onClick: handleWikipediaSummary,
          },
          {
            key: "wikipediaSuggestions",
            text: "Wikipedia Suggestions",
            onClick: handleWikipediaSuggestions,
          },
          {
            key: "wikipediaImage",
            text: "Wikipedia Image",
            onClick: handleWikipediaImage,
          },
        ],
      },
    },
  ];

  const insertFarItems = [
    // {
    //     key: 'loadDocument',
    //     text: 'Load Document',
    //     iconProps: { iconName: 'TextDocument' },
    // }
  ];

  return <CommandBar items={insertItems} farItems={insertFarItems} />;
}
