import React from "react";
import { v4 as uuidv4 } from "uuid";

import CardComponent from "../../../components/CardComponent";
import { AppController } from "../../../contexts/AppController";
import { strings } from "../../../strings";
import { createNotebook } from "../../../structures/notebook/NotebookConstructors";
import { createTab } from "../../../structures/tabs/TabsConstructors";
import { addTab } from "../../../structures/tabs/TabsManipulation";
import NotebookPage from "../../NotebookPage/NotebookPage";
import { MainPageViewProps } from "../IMainPage";

const newIcon = {
  iconName: "FileTemplate",
};

export default function EmptyView({ id }: MainPageViewProps) {
  const appController = React.useContext(AppController);

  const handleNew = () => {
    const id = uuidv4();
    const notebook = createNotebook({ name: `Unnamed Notebook ${id}` });

    appController.tabsDo(addTab, {
      tab: createTab({
        content: <NotebookPage key={id} id={id} notebook={notebook} />,
      }),
    });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-row space-x-1">
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
