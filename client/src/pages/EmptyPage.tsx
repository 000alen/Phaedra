// TODO: Refactor handling calls

import "../css/pages/EmptyPage.css";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../components/CardComponent";
import { AppController } from "../contexts/AppController";
import { openFile } from "../IO/NotebookIO";
import { createNotebook } from "../manipulation/NotebookManipulation";
import { setTabContent } from "../manipulation/TabsManipulation";
import {
  addTask,
  createTask,
  removeTask,
} from "../manipulation/TasksManipulation";
import { EmptyPageProps } from "./IEmptyPage";
import NotebookPage from "./NotebookPage/NotebookPage";

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
    appController.tasksDo(addTask, {
      task: createTask({ id: id, name: "Opening file" }),
    });
    setDialogOpen(true);

    openFile().then(({ notebook, notebookPath }) => {
      appController.tasksDo(removeTask, { id: taskId });
      setDialogOpen(false);

      if (!notebook) return;

      appController.tabsDo(setTabContent, {
        id: id,
        content: (
          <NotebookPage
            key={id}
            id={id}
            notebook={notebook}
            notebookPath={notebookPath}
          />
        ),
      });
    });
  };

  const handleNew = () => {
    const notebook = createNotebook({ name: `Unnamed Notebook ${id}` });

    appController.tabsDo(setTabContent, {
      id: id,
      content: <NotebookPage key={id} id={id} notebook={notebook} />,
    });
  };

  return (
    <div className="emptyPage flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={openIcon}
          title="Open file"
          subtitle="Open a PDF document or a JSON notebook"
          onClick={handleOpen}
        />

        <CardComponent
          iconProps={newIcon}
          title="Create new file"
          subtitle="Create a JSON notebook"
          onClick={handleNew}
        />
      </div>
    </div>
  );
}
