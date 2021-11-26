import React from "react";
import { v4 as uuidv4 } from "uuid";

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
          className="select-none"
          style={{
            opacity: 0.5,
          }}
        >
          {shortcuts.map((shortcut) => {
            return (
              <dl
                style={{
                  display: "table-row",
                }}
              >
                <dt
                  style={{
                    display: "table-cell",
                  }}
                >
                  <Label
                    style={{
                      textAlign: "right",
                    }}
                  >
                    {shortcut.description}
                  </Label>
                </dt>
                <dd
                  style={{
                    display: "table-cell",
                  }}
                >
                  {shortcut.keys
                    .split("+")
                    .map((key) => <kbd>{key}</kbd>)
                    .map((key, index, keys) =>
                      index === keys.length - 1 ? key : <>{key} + </>
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
