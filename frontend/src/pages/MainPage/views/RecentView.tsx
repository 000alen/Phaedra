import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { DetailsList } from "@fluentui/react";

import { getRecent, readFileSync } from "../../../API/ElectronAPI";
import { StoreFile } from "../../../API/IElectronAPI";
import { AppController } from "../../../contexts/AppController";
import { addTab, createTab } from "../../../manipulation/TabsManipulation";
import NotebookPage from "../../NotebookPage/NotebookPage";
import { MainPageViewProps } from "../IMainPage";

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

interface RecentViewState {
  items: StoreFile[];
}

export default class RecentView extends Component<
  MainPageViewProps,
  RecentViewState
> {
  static contextType = AppController;

  constructor(props: MainPageViewProps) {
    super(props);

    this.handleInvokedItem = this.handleInvokedItem.bind(this);

    this.state = {
      items: [],
    };
  }

  componentDidMount() {
    getRecent().then((items) => {
      this.setState({
        items: this.formatItems(items),
      });
    });
  }

  formatItems(items: StoreFile[]): any[] {
    return items.map((item) => {
      return {
        key: uuidv4(),
        name: item.name,
        path: item.path,
        lastOpened: item.lastOpened,
      };
    });
  }

  handleInvokedItem(item: any) {
    const appController = this.context;
    const { id } = this.props;
    const { path } = item;

    readFileSync(path, "utf-8").then((_notebook) => {
      let notebook = JSON.parse(_notebook as string);

      appController.tabsDo(addTab, {
        tab: createTab({
          id: id,
          content: (
            <NotebookPage
              key={id}
              id={id}
              notebook={notebook}
              notebookPath={path}
            />
          ),
        }),
      });
    });
  }

  render() {
    const { items } = this.state;

    return (
      <div>
        <DetailsList
          items={items}
          columns={columns}
          onItemInvoked={this.handleInvokedItem}
        />
      </div>
    );
  }
}
