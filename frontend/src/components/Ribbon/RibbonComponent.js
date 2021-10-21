import React from "react";
import { Pivot, PivotItem } from "@fluentui/react";

import FileItems from "./items/FileItems";
import HomeItems from "./items/HomeItems";
import InsertItems from "./items/InsertItems";
import ReviewItems from "./items/ReviewItems";
import ViewItems from "./items/ViewItems";
import EditItems from "./items/EditItems";

import { theme } from "../../index";

import "../../css/components/RibbonComponent.css";

export default function RibbonComponent() {
  const ribbonStyle = {
    backgroundColor: theme.palette.white,
  };

  return (
    <div className="ribbon" style={ribbonStyle}>
      <Pivot aria-label="Ribbon" defaultSelectedKey="home">
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
