import React from "react";
import { Subtract } from "utility-types";

import { MessageBarType } from "@fluentui/react";

export interface IMessage {
  id: string;
  text: string;
  type: MessageBarType;
}

interface UseMesagesProps {
  forwardsRef: React.Ref<any>;
}

interface UseMessagesState {
  messages: IMessage[];
}

export interface UseMessagesInjectedProps {
  messages: IMessage[];
  messagesManager: MessagesManager;
}

export interface MessagesManager {
  get(id: string): IMessage | undefined;
  add(message: IMessage): void;
  remove(id: string): void;
  setText(id: string, text: string): void;
  setType(id: string, type: MessageBarType): void;
}

export function UseMessages<P extends UseMessagesInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithMessages extends React.Component<
    Subtract<P & UseMesagesProps, UseMessagesInjectedProps>,
    UseMessagesState
  > {
    constructor(props: P & UseMesagesProps) {
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
          {...(this.props as P)}
          ref={this.props.forwardsRef}
          messages={this.state.messages}
          messagesManager={this}
        />
      );
    }
  }

  return React.forwardRef((props, ref) => (
    <WithMessages {...(props as P)} forwardsRef={ref} />
  ));
}
