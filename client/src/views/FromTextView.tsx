import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { Card } from "../components/Card";
import { AppController } from "../contexts/AppController";
import { openText } from "../IO/NotebookIO";
import { MainPageViewProps } from "../pages/MainPage";
import { NotebookPage } from "../pages/NotebookPage";
import { strings } from "../resources/strings";

const openIcon = {
  iconName: "OpenFile",
};

export function FromTextView({ id }: MainPageViewProps) {
  const appController = React.useContext(AppController);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    if (dialogOpen) return;
    setDialogOpen(true);

    openText().then(({ notebook }) => {
      setDialogOpen(false);
      if (!notebook) return;

      const id = uuidv4();

      appController.addTab({
        id: id,
        title: strings.newTabTitle,
        content: <NotebookPage key={id} id={id} notebook={notebook} />,
      });
    });
  };

  return (
    <div className="w-[100%] h-[100%] flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <Card
          iconProps={openIcon}
          title={strings.openTextFileButtonLabel}
          subtitle={strings.openTextFileButtonDescription}
          onClick={handleOpen}
        />
      </div>
    </div>
  );
}
