import "../../css/components/RibbonComponent.css";

import Mousetrap from "mousetrap";
import React from "react";

import { Pivot, PivotItem } from "@fluentui/react";

import { NotebookPageController } from "../../contexts/NotebookPageController";
import { theme } from "../../index";
import { RibbonComponentShortcuts } from "../../shortcuts/RibbonComponentShortcuts";
import { RibbonProps, RibbonState } from "./IRibbonComponent";
import EditItems from "./items/EditItems";
import FileItems from "./items/FileItems";
import HomeItems from "./items/HomeItems";
import InsertItems from "./items/InsertItems";
import ReviewItems from "./items/ReviewItems";
import ViewItems from "./items/ViewItems";

export default class RibbonComponent extends React.Component<
  RibbonProps,
  RibbonState
> {
  static contextType = NotebookPageController;

  componentDidMount() {
    for (const [keys, action] of Object.entries(RibbonComponentShortcuts)) {
      Mousetrap.bind(keys, () => action(this.context), "keyup");
    }
  }

  componentWillUnmount() {
    for (const keys of Object.keys(RibbonComponentShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  render() {
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
}
