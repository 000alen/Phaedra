import React, { useState } from "react";

import CardComponent from "../components/CardComponent";

import { createNotebook } from "../manipulation/NotebookManipulation";
import { setTabContent } from "../manipulation/TabsManipulation";

import NotebookPage from "./NotebookPage/NotebookPage";

import { openFile } from "../NotebookIO";

import "../css/pages/EmptyPage.css";
import { AppController } from "../AppController";

const openIcon = {
  iconName: "OpenFile",
};

const newIcon = {
  iconName: "FileTemplate",
};

export function EmptyPage({ id }) {
  const appController = React.useContext(AppController);
  const statusBarRef = appController.getStatusBarRef();

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    const { statusBarController } = statusBarRef.current.state;

    if (dialogOpen) return;

    statusBarController.showLoading();
    setDialogOpen(true);

    openFile().then(({ notebook, notebookPath }) => {
      statusBarController.hideLoading();
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
