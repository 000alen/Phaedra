import Mousetrap from "mousetrap";
import React, { Component } from "react";

import { AppController } from "../contexts/AppController";
import { MainPageShortcuts } from "../shortcuts/MainPageShortcuts";

export interface MainTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
}

export interface MainTabState {}

export class MainTab extends Component<MainTabProps, MainTabState> {
  static contextType = AppController;

  componentDidMount() {
    const { tabRef } = this.props;
    tabRef(this);

    for (const [keys, action] of Object.entries(MainPageShortcuts)) {
      Mousetrap.bind(
        keys,
        (event) => {
          action(this.context);
          event.preventDefault();
        },
        "keyup"
      );
    }
  }

  componentWillUnmount() {
    const { tabRef } = this.props;
    tabRef(undefined);

    for (const keys of Object.keys(MainPageShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  render() {
    return <div className="w-[100%] h-[100%]">TODO</div>;
  }
}
