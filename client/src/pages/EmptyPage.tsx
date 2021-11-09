// TODO: Refactor handling calls

import "../css/EmptyPage.css";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../components/CardComponent";
import { AppController } from "../contexts/AppController";
import { openFile } from "../IO/NotebookIO";
import { strings } from "../resources/strings";
import { createNotebook } from "../structures/NotebookStructure";
import NotebookPage from "./NotebookPage";

export interface EmptyPageProps {
  id: string;
}

const openIcon = {
  iconName: "OpenFile",
};

const newIcon = {
  iconName: "FileTemplate",
};

export function EmptyPage({ id }: EmptyPageProps): JSX.Element {
  const appController = React.useContext(AppController);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    if (dialogOpen) return;

    const taskId = uuidv4();
    appController.addTask({ id: id, name: strings.openingFileTaskLabel });
    setDialogOpen(true);

    openFile().then(({ notebook, notebookPath }) => {
      appController.removeTask(taskId);
      setDialogOpen(false);

      if (!notebook) return;

      appController.setTabContent(
        id,
        <NotebookPage
          key={id}
          id={id}
          notebook={notebook}
          notebookPath={notebookPath}
        />
      );
    });
  };

  const handleNew = () => {
    const notebook = createNotebook({ name: `Unnamed Notebook ${id}` });

    appController.setTabContent(
      id,
      <NotebookPage key={id} id={id} notebook={notebook} />
    );
  };

  return (
    <div className="emptyPage flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={openIcon}
          title={strings.openFileButtonLabel}
          subtitle={strings.openFileButtonDescription}
          onClick={handleOpen}
        />

        <CardComponent
          iconProps={newIcon}
          title={strings.createNotebookButtonLabel}
          subtitle={strings.createNotebookButtonDescription}
          onClick={handleNew}
        />
      </div>
    </div>
  );
}
