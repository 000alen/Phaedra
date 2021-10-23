import React, { Component } from "react";
import { DetailsList } from "@fluentui/react";
import { getRecent, readFile } from "../../../API/ElectronAPI";
import { v4 as uuidv4 } from "uuid";
import { addTab, createTab } from "../../../manipulation/TabsManipulation";
import NotebookPage from "../../NotebookPage/NotebookPage";
import { AppController } from "../../../contexts/AppController";

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

interface RecentViewProps {
  id: string;
}

interface RecentViewState {
  items: any[];
}

export default class RecentView extends Component<
  RecentViewProps,
  RecentViewState
> {
  static contextType = AppController;

  constructor(props: RecentViewProps) {
    super(props);

    this.handleInvokedItem = this.handleInvokedItem.bind(this);

    const { id } = props;

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

  formatItems(items: any[]): any[] {
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

    readFile(path, "utf-8").then((_notebook) => {
      let notebook = JSON.parse(_notebook);

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
