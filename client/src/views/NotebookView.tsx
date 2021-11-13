import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Card } from "../components/Card";
import { AppController } from "../contexts/AppController";
import { openJson } from "../IO/NotebookIO";
import { MainPageViewProps } from "../pages/MainPage";
import { NotebookPage } from "../pages/NotebookPage";
import { strings } from "../resources/strings";

const openIcon = {
  iconName: "OpenFile",
};

export function NotebookView({ id }: MainPageViewProps) {
  const appController = React.useContext(AppController);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    if (dialogOpen) return;
    setDialogOpen(true);

    openJson().then(({ notebook, notebookPath }) => {
      setDialogOpen(false);
      if (!notebook) return;

      const id = uuidv4();

      appController.addTab({
        id: id,
        title: strings.newTabTitle,
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

  return (
    <div className="fill-parent flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <Card
          iconProps={openIcon}
          title={strings.openNotebookButtonLabel}
          subtitle={strings.openNotebookButtonDescription}
          onClick={handleOpen}
        />
      </div>
    </div>
  );
}
