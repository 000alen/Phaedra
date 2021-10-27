import React, { Component } from "react";

import { DetailsList } from "@fluentui/react";

import { getPinned } from "../../../API/ElectronAPI";
import { StoreFile } from "../../../API/IElectronAPI";
import { strings } from "../../../strings";
import { MainPageViewProps } from "../IMainPage";

const columns = [
  {
    key: "name",
    name: strings.nameButtonLabel,
    fieldName: "name",
    minWidth: 100,
    maxWidth: 200,
    isResizable: true,
  },
  {
    key: "path",
    name: strings.pathButtonLabel,
    fieldName: "path",
    minWidth: 100,
    maxWidth: 200,
    isResizable: true,
  },
  {
    key: "lastOpened",
    name: strings.lastOpenedButtonLabel,
    fieldName: "lastOpened",
    minWidth: 100,
    maxWidth: 200,
    isResizable: true,
  },
];

interface PinnedViewState {
  items: StoreFile[];
}

export default class PinnedView extends Component<
  MainPageViewProps,
  PinnedViewState
> {
  constructor(props: MainPageViewProps) {
    super(props);

    this.state = {
      items: [],
    };
  }

  componentDidMount() {
    getPinned().then((items) => {
      this.setState({
        items: this.formatItems(items),
      });
    });
  }

  formatItems(items: StoreFile[]): any[] {
    return items.map((item) => {
      return {
        key: item.name,
        name: item.name,
        path: item.path,
        lastOpened: item.lastOpened,
      };
    });
  }

  render() {
    const { items } = this.state;

    return (
      <div>
        <DetailsList items={items} columns={columns} />
      </div>
    );
  }
}
