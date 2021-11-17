import React from "react";

import { MessageBarType } from "@fluentui/react";

export interface IMessage {
  id: string;
  text: string;
  type: MessageBarType;
}

interface UseMessagesProps {}

interface UseMessagesState {
  messages: IMessage[];
}

export function UseMessages<P extends object>(
  Component: React.ComponentType<P>
) {
  return class extends React.Component<P & UseMessagesProps, UseMessagesState> {
    constructor(props: P & UseMessagesProps) {
      super(props);

      this.get = this.get.bind(this);
      this.add = this.add.bind(this);
      this.remove = this.remove.bind(this);
      this.setText = this.setText.bind(this);
      this.setType = this.setType.bind(this);

      this.state = {
        messages: [],
      };
    }

    get(id: string) {
      return this.state.messages.find((message) => message.id === id);
    }

    add(message: IMessage) {
      const newMessages = [...this.state.messages];
      newMessages.push(message);
      this.setState({ messages: newMessages });
    }

    remove(id: string) {
      const newMessages = this.state.messages.filter(
        (message) => message.id !== id
      );
      this.setState({ messages: newMessages });
    }

    setText(id: string, text: string) {
      const newMessages = this.state.messages.map((message) =>
        message.id === id ? { ...message, text } : message
      );
      this.setState({ messages: newMessages });
    }

    setType(id: string, type: MessageBarType) {
      const newMessages = this.state.messages.map((message) =>
        message.id === id ? { ...message, type } : message
      );
      this.setState({ messages: newMessages });
    }

    render() {
      return (
        <Component
          messages={this.state.messages}
          messagesManager={this}
          {...(this.props as P)}
        />
      );
    }
  };
}
