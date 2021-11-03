import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../components/CardComponent";
import { AppController } from "../contexts/AppController";
import { openText } from "../IO/NotebookIO";
import { MainPageViewProps } from "../pages/MainPage";
import NotebookPage from "../pages/NotebookPage";
import { strings } from "../resources/strings";
import { addTab, createTab } from "../structures/TabsStructure";

const openIcon = {
  iconName: "OpenFile",
};

export default function FromTextView({ id }: MainPageViewProps) {
  const appController = React.useContext(AppController);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    if (dialogOpen) return;
    setDialogOpen(true);

    openText().then(({ notebook }) => {
      setDialogOpen(false);
      if (!notebook) return;

      const id = uuidv4();

      appController.tabsDo(addTab, {
        tab: createTab({
          content: <NotebookPage key={id} id={id} notebook={notebook} />,
        }),
      });
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row space-x-1">
        <CardComponent
          iconProps={openIcon}
          title={strings.openTextFileButtonLabel}
          subtitle={strings.openTextFileButtonDescription}
          onClick={handleOpen}
        />
      </div>
    </div>
  );
}
