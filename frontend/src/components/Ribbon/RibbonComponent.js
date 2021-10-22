import React from "react";
import { Pivot, PivotItem } from "@fluentui/react";

import FileItems from "./items/FileItems";
import HomeItems from "./items/HomeItems";
import InsertItems from "./items/InsertItems";
import ReviewItems from "./items/ReviewItems";
import ViewItems from "./items/ViewItems";
import EditItems from "./items/EditItems";

import { theme } from "../../index";
import { NotebookPageController } from "../../contexts/NotebookPageController";
import { RibbonComponentShortcuts } from "../../shortcuts/RibbonComponentShortcuts";
import Mousetrap from "mousetrap";

import "../../css/components/RibbonComponent.css";

export default class RibbonComponent extends React.Component {
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
