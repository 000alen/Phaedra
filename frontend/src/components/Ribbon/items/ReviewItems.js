import React from "react";
import { CommandBar, MessageBarType } from "@fluentui/react";

import {
  addMeaningCell,
  addSynonymCell,
  addAntonymCell,
} from "../../../manipulation/NotebookManipulation";

export default function ReviewItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const handleMeaning = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;

    if (activePage && commandBoxRef.current) {
      const { command } = commandBoxRef.current.state;
      notebookController.do(addMeaningCell, {
        word: command,
        pageId: activePage,
      });
      commandBoxRef.current.consume();
    } else if (activePage) {
      pageController.addMessageBar("No word selected", MessageBarType.error);
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const handleSynonym = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;

    if (activePage && commandBoxRef.current) {
      const { command } = commandBoxRef.current.state;
      notebookController.do(addSynonymCell, {
        word: command,
        pageId: activePage,
      });
      commandBoxRef.current.consume();
    } else if (activePage) {
      pageController.addMessageBar("No word selected", MessageBarType.error);
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const handleAntonym = () => {
    const { notebookController } = notebookRef.current.state;
    const { activePage } = notebookRef.current.state;

    if (activePage && commandBoxRef.current) {
      const { command } = commandBoxRef.current.state;
      notebookController.do(addAntonymCell, {
        word: command,
        pageId: activePage,
      });
      commandBoxRef.current.consume();
    } else if (activePage) {
      pageController.addMessageBar("No word selected", MessageBarType.error);
    } else {
      pageController.addMessageBar("No page selected", MessageBarType.error);
    }
  };

  const reviewItems = [
    {
      key: "dictionary",
      text: "Dictionary",
      iconProps: { iconName: "Dictionary" },
      subMenuProps: {
        items: [
          {
            key: "meaning",
            text: "Meaning",
            onClick: handleMeaning,
          },
          {
            key: "synonyms",
            text: "Synonyms",
            onClick: handleSynonym,
          },
          {
            key: "antonyms",
            text: "Antonyms",
            onClick: handleAntonym,
          },
        ],
      },
    },
  ];

  return <CommandBar items={reviewItems} />;
}
