import React, { Component } from "react";
import { DetailsList } from "@fluentui/react";
import { getPinned } from "../../../API/ElectronAPI";

const columns = [
  {
    key: "name",
    name: "Name",
    fieldName: "name",
    minWidth: 100,
    maxWidth: 200,
    isResizable: true,
  },
  {
    key: "path",
    name: "Path",
    fieldName: "path",
    minWidth: 100,
    maxWidth: 200,
    isResizable: true,
  },
  {
    key: "lastOpened",
    name: "Last Opened",
    fieldName: "lastOpened",
    minWidth: 100,
    maxWidth: 200,
    isResizable: true,
  },
];

interface PinnedViewProps {
  id: string;
}

interface PinnedViewState {
  items: any[];
}

export default class PinnedView extends Component<
  PinnedViewProps,
  PinnedViewState
> {
  constructor(props: PinnedViewProps) {
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

  formatItems(items: any[]): any[] {
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
