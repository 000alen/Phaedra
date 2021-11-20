import React from "react";

import { AppController } from "../contexts";
import { IShortcuts, UseShortcuts } from "../HOC/UseShortcuts";

export interface MainTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
}

export interface MainTabState {}

class MainTabSkeleton extends React.Component<MainTabProps, MainTabState> {
  static contextType = AppController;

  componentDidMount() {
    const { tabRef } = this.props;
    tabRef(this);
  }

  componentWillUnmount() {
    const { tabRef } = this.props;
    tabRef(undefined);
  }

  render() {
    return <div className="w-[100%] h-[100%]">TODO</div>;
  }
}

const MainTabShortcuts: IShortcuts<React.RefObject<MainTabSkeleton>> = {};

// @ts-ignore
export const MainTab = UseShortcuts(MainTabSkeleton, MainTabShortcuts);
