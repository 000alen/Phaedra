import React from "react";
import { v4 as uuidv4 } from "uuid";

import { MessageBarType } from "@fluentui/react";

import { AppController, IAppController } from "../contexts";
import { IShortcuts, UseShortcuts } from "../HOC/UseShortcuts";

export interface MainTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
}

export interface MainTabState {}

class MainTabSkeleton extends React.Component<MainTabProps, MainTabState> {
  static contextType = AppController;

  constructor(props: MainTabProps) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { tabRef } = this.props;
    tabRef(this);
  }

  componentWillUnmount() {
    const { tabRef } = this.props;
    tabRef(undefined);
  }

  handleClick(event: React.MouseEvent) {
    const appController: IAppController = this.context;

    appController.messagesManager!.add({
      id: uuidv4(),
      text: "Hello World",
      type: MessageBarType.success,
    });
  }

  render() {
    return (
      <div className="w-[100%] h-[100%]">
        <button onClick={this.handleClick}>TEST</button>
      </div>
    );
  }
}

const MainTabShortcuts: IShortcuts<React.RefObject<MainTabSkeleton>> = {};

// @ts-ignore
export const MainTab = UseShortcuts(MainTabSkeleton, MainTabShortcuts);
