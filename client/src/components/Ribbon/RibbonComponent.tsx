import "../../css/RibbonComponent.css";

import React from "react";

import { Pivot, PivotItem } from "@fluentui/react";

import { NotebookPageController } from "../../contexts/NotebookPageController";
import { strings } from "../../resources/strings";
import { theme } from "../../resources/theme";
import FileItems from "./items/FileItems";
import HomeItems from "./items/HomeItems";

export interface RibbonProps {
  ribbonKey: string;
}

export interface RibbonItemsProps {}

export function RibbonComponent({ ribbonKey }: RibbonProps) {
  const notebookPageController = React.useContext(NotebookPageController);

  const ribbonStyle = {
    backgroundColor: theme.palette.white,
  };

  return (
    <div className="ribbon" style={ribbonStyle}>
      <Pivot
        selectedKey={ribbonKey}
        onLinkClick={notebookPageController.setRibbonKey}
      >
        <PivotItem headerText={strings.ribbonFileHeader} itemKey="file">
          <FileItems />
        </PivotItem>

        <PivotItem headerText={strings.ribbonHomeHeader} itemKey="home">
          <HomeItems />
        </PivotItem>
      </Pivot>
    </div>
  );
}
