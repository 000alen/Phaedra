import React from "react";
import { CommandBar } from "@fluentui/react";
import {
  handleEntities,
  handleWikipediaSummary,
  handleWikipediaSuggestions,
  handleWikipediaImage,
} from "../../../actions/InsertActions";
import { NotebookPageController } from "../../../pages/NotebookPage/NotebookPageController";

export default function InsertItems() {
  const notebookPageController = React.useContext(NotebookPageController);
  const notebookRef = notebookPageController.getNotebookRef();
  const commandBoxRef = notebookPageController.getCommandBoxRef();

  const insertItems = [
    {
      key: "entities",
      text: "Entities",
      iconProps: { iconName: "People" },
      onClick: () => handleEntities(notebookRef, notebookPageController),
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
                notebookPageController
              ),
          },
          {
            key: "wikipediaSuggestions",
            text: "Wikipedia Suggestions",
            onClick: () =>
              handleWikipediaSuggestions(
                notebookRef,
                commandBoxRef,
                notebookPageController
              ),
          },
          {
            key: "wikipediaImage",
            text: "Wikipedia Image",
            onClick: () =>
              handleWikipediaImage(
                notebookRef,
                commandBoxRef,
                notebookPageController
              ),
          },
        ],
      },
    },
  ];

  return <CommandBar items={insertItems} />;
}
