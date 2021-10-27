import "../../css/components/RibbonComponent.css";

import React from "react";

import { Pivot, PivotItem } from "@fluentui/react";

import { NotebookPageController } from "../../contexts/NotebookPageController";
import { theme } from "../../index";
import { strings } from "../../strings";
import { RibbonProps } from "./IRibbonComponent";
import EditItems from "./items/EditItems";
import FileItems from "./items/FileItems";
import HomeItems from "./items/HomeItems";
import InsertItems from "./items/InsertItems";
import ReviewItems from "./items/ReviewItems";
import ViewItems from "./items/ViewItems";

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

        <PivotItem headerText={strings.ribbonEditHeader} itemKey="edit">
          <EditItems />
        </PivotItem>

        <PivotItem headerText={strings.ribbonInsertHeader} itemKey="insert">
          <InsertItems />
        </PivotItem>

        <PivotItem headerText={strings.ribbonReviewHeader} itemKey="review">
          <ReviewItems />
        </PivotItem>

        <PivotItem headerText={strings.ribbonViewHeader} itemKey="view">
          <ViewItems />
        </PivotItem>
      </Pivot>
    </div>
  );
}
