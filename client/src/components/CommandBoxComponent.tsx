import "../css/components/CommandBoxComponent.css";

import React, { Component, FormEvent } from "react";

import { TextField } from "@fluentui/react";

import { strings } from "../resources/strings";

export interface CommandBoxComponentProps {}
export interface CommandBoxComponentState {
  command: string;
}

export default class CommandBoxComponent extends Component<
  CommandBoxComponentProps,
  CommandBoxComponentState
> {
  constructor(props: CommandBoxComponentProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.consume = this.consume.bind(this);

    this.state = {
      command: "",
    };
  }

  handleChange(
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string | undefined
  ) {
    this.setState((state) => {
      return { ...state, command: newValue! };
    });
  }

  consume() {
    this.setState((state) => {
      return { ...state, command: "" };
    });
  }

  render() {
    return (
      <div className="commandBox w-96">
        <TextField
          placeholder={strings.commandBoxPlaceholder}
          value={this.state.command}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
