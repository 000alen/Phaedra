import React from "react";

import { Label } from "@fluentui/react";

import { AppShortcuts } from "../App";
import { AppController } from "../contexts";
import { IShortcut, UseShortcuts } from "../HOC/UseShortcuts";

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
    const shortcuts: IShortcut<any>[] = [...MainTabShortcuts, ...AppShortcuts];

    return (
      <div className="w-[100%] h-[100%] flex items-center justify-center">
        <div
          className="select-none space-y-2"
          style={{
            opacity: 0.5,
          }}
        >
          {shortcuts.map((shortcut, index) => {
            return (
              <dl key={index}>
                <dt>
                  <Label>{shortcut.description}</Label>
                </dt>
                <dd>
                  {shortcut.keys
                    .split("+")
                    .map((key, index) => <kbd key={index}>{key}</kbd>)
                    .map((key, index, keys) =>
                      index === keys.length - 1 ? (
                        key
                      ) : (
                        <React.Fragment key={index}>{key} +</React.Fragment>
                      )
                    )}
                </dd>
              </dl>
            );
          })}
        </div>
      </div>
    );
  }
}

const MainTabShortcuts: IShortcut<MainTabSkeleton>[] = [];

export const MainTab = UseShortcuts(MainTabSkeleton, MainTabShortcuts);
