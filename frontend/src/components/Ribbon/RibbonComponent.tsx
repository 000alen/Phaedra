import "../../css/components/RibbonComponent.css";

import Mousetrap from "mousetrap";
import React from "react";

import { Pivot, PivotItem } from "@fluentui/react";

import { NotebookPageController } from "../../contexts/NotebookPageController";
import { theme } from "../../index";
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
        aria-label="Ribbon"
        selectedKey={ribbonKey}
        onLinkClick={notebookPageController.setRibbonKey}
      >
        <PivotItem headerText="File" itemKey="file">
          <FileItems />
        </PivotItem>

        <PivotItem headerText="Home" itemKey="home">
          <HomeItems />
        </PivotItem>

        <PivotItem headerText="Edit" itemKey="edit">
          <EditItems />
        </PivotItem>

        <PivotItem headerText="Insert" itemKey="insert">
          <InsertItems />
        </PivotItem>

        <PivotItem headerText="Review" itemKey="review">
          <ReviewItems />
        </PivotItem>

        <PivotItem headerText="View" itemKey="view">
          <ViewItems />
        </PivotItem>
      </Pivot>
    </div>
  );
}
