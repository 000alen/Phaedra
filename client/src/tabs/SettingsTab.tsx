import React from "react";
import { AppController } from "../contexts";
import Form from "@rjsf/fluent-ui";
import { JSONSchema7 } from "json-schema";
import { getSettings, setSettings } from "../electron";
import { PrimaryButton } from "@fluentui/react";

interface SettingsTabState {
  settings: object | null;
}

const schema = {
  title: "Settings",
  type: "object",
  properties: {
    name: {
      type: "string",
      title: "Name",
    },
    key: {
      type: "string",
      title: "OpenAI API Key",
    },
  },
  required: ["name", "key"],
} as JSONSchema7;

const uiSchema = {
  key: {
    "ui:widget": "password",
  },
};

export class SettingsTab extends React.Component<TabProps, SettingsTabState> {
  static contextType = AppController;

  constructor(props: TabProps) {
    super(props);

    this.state = {
      settings: null,
    };
  }

  componentDidMount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(this);

    getSettings()
      .then((settings: object) => {
        this.setState({ settings });
      })
      .catch((error) => {});
  }

  componentWillUnmount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(undefined);
  }

  onSubmit(event: any) {
    setSettings(event.formData);
  }

  render() {
    const { settings } = this.state;
    return (
      <div className="w-full h-full p-2">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={settings}
          onSubmit={this.onSubmit}
        >
          <PrimaryButton type="submit">Save</PrimaryButton>
        </Form>
      </div>
    );
  }
}
