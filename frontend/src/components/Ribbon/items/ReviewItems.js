import React from "react";
import { CommandBar } from "@fluentui/react";
import {
  handleMeaning,
  handleSynonym,
  handleAntonym,
} from "../../../actions/ReviewActions";

export default function ReviewItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
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
            onClick: () =>
              handleMeaning(notebookRef, commandBoxRef, pageController),
          },
          {
            key: "synonyms",
            text: "Synonyms",
            onClick: () =>
              handleSynonym(notebookRef, commandBoxRef, pageController),
          },
          {
            key: "antonyms",
            text: "Antonyms",
            onClick: () =>
              handleAntonym(notebookRef, commandBoxRef, pageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={reviewItems} />;
}
