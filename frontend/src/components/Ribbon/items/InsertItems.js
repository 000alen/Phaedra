import React from "react";
import { CommandBar } from "@fluentui/react";
import {
  handleEntities,
  handleWikipediaSummary,
  handleWikipediaSuggestions,
  handleWikipediaImage,
} from "../../../actions/InsertActions";

export default function InsertItems({
  notebookRef,
  commandBoxRef,
  appController,
  pageController,
}) {
  const insertItems = [
    {
      key: "entities",
      text: "Entities",
      iconProps: { iconName: "People" },
      onClick: () => handleEntities(notebookRef, pageController),
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
            onClick: () =>
              handleWikipediaSummary(
                notebookRef,
                commandBoxRef,
                pageController
              ),
          },
          {
            key: "wikipediaSuggestions",
            text: "Wikipedia Suggestions",
            onClick: () =>
              handleWikipediaSuggestions(
                notebookRef,
                commandBoxRef,
                pageController
              ),
          },
          {
            key: "wikipediaImage",
            text: "Wikipedia Image",
            onClick: () =>
              handleWikipediaImage(notebookRef, commandBoxRef, pageController),
          },
        ],
      },
    },
  ];

  return <CommandBar items={insertItems} />;
}
