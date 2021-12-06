import React from "react";
import { AppController } from "../contexts";
import Form from "@rjsf/fluent-ui";
import { JSONSchema7 } from "json-schema";

export interface SettingsTabProps {
  tabId: string;
  setActiveTabRef: (ref: any) => void;
}

interface SettingsTabState {}

export class SettingsTab extends React.Component<
  SettingsTabProps,
  SettingsTabState
> {
  static contextType = AppController;

  componentDidMount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(this);
  }

  componentWillUnmount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(undefined);
  }

  render() {
    const schema = {
      title: "Settings",
      type: "object",
    } as JSONSchema7;

    return (
      <div className="w-full h-full p-2">
        <Form schema={schema} />
      </div>
    );
  }
}
