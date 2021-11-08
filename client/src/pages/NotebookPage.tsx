import "../css/NotebookPage.css";

import Mousetrap from "mousetrap";
import React, { Component } from "react";

import {
  IconButton,
  IOverflowSetItemProps,
  Label,
  MessageBar,
  OverflowSet,
  PivotItem,
} from "@fluentui/react";

import NotebookComponent from "../components/NotebookComponent";
import { RibbonComponent } from "../components/Ribbon/RibbonComponent";
import { AppController, IAppController } from "../contexts/AppController";
import { INotebookController } from "../contexts/NotebookController";
import {
  INotebookPageController,
  NotebookPageController,
} from "../contexts/NotebookPageController";
import { NotebookPageShortcuts } from "../shortcuts/NotebookPageShortcuts";
import {
  IMessage,
  IMessagesManipulation,
  IMessagesManipulationArguments,
  removeMessage,
} from "../structures/MessagesStructure";
import { INotebook } from "../structures/NotebookStructure";
import { FileView } from "../views/FileView";

export interface NotebookPageProps {
  id: string;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookPageState {
  messages: IMessage[];
  ribbonKey: string;
  notebookPageController: INotebookPageController;
}

export interface NotebookPageViewProps {}

// TODO: Extract constants to a preferences file
const numberOfMessages = 3;

export default class NotebookPage extends Component<
  NotebookPageProps,
  NotebookPageState
> {
  static contextType = AppController;

  notebookRef: React.RefObject<NotebookComponent>;

  constructor(props: NotebookPageProps) {
    super(props);

    this.messagesDo = this.messagesDo.bind(this);
    this.getAppController = this.getAppController.bind(this);
    this.getNotebookController = this.getNotebookController.bind(this);
    this.getRibbonKey = this.getRibbonKey.bind(this);
    this.setRibbonKey = this.setRibbonKey.bind(this);

    this.onRenderMessage = this.onRenderMessage.bind(this);
    this.onRenderMessageOverflow = this.onRenderMessageOverflow.bind(this);

    this.notebookRef = React.createRef();

    this.state = {
      messages: [],
      ribbonKey: "home",
      notebookPageController: {
        messagesDo: this.messagesDo,
        getAppController: this.getAppController,
        getNotebookController: this.getNotebookController,
        getRibbonKey: this.getRibbonKey,
        setRibbonKey: this.setRibbonKey,
      },
    };
  }

  componentDidMount(): void {
    const { notebookPageController } = this.state;
    for (const [keys, action] of Object.entries(NotebookPageShortcuts)) {
      Mousetrap.bind(
        keys,
        (event) => {
          action(notebookPageController);
          event.preventDefault();
        },
        "keyup"
      );
    }
  }

  componentWillUnmount(): void {
    for (const keys of Object.keys(NotebookPageShortcuts)) {
      Mousetrap.unbind(keys);
    }
  }

  messagesDo(
    manipulation: IMessagesManipulation,
    args: IMessagesManipulationArguments
  ) {
    const { messages } = this.state;
    const currentMessages = manipulation(messages, args);

    this.setState((state) => {
      return {
        ...state,
        messages: currentMessages,
      };
    });
  }

  getAppController(): IAppController {
    return this.context;
  }

  getNotebookController(): INotebookController {
    return this.notebookRef.current!.state.notebookController!;
  }

  getRibbonKey(): string {
    return this.state.ribbonKey;
  }

  setRibbonKey(item: PivotItem | undefined) {
    this.setState((state) => {
      return { ...state, ribbonKey: item!.props.itemKey! };
    });
  }

  onRenderMessage(item: IOverflowSetItemProps) {
    return (
      <MessageBar
        key={item.id}
        id={item.id}
        isMultiline={false}
        messageBarType={item.type}
        onDismiss={() => {
          this.messagesDo(removeMessage, { id: item.id });
        }}
      >
        {item.text}
      </MessageBar>
    );
  }

  onRenderMessageOverflow(overflowItems: IOverflowSetItemProps[] | undefined) {
    return (
      <IconButton
        menuIconProps={{ iconName: "More" }}
        menuProps={{ items: overflowItems! }}
      />
    );
  }

  render(): JSX.Element {
    const { messages, notebookPageController, ribbonKey } = this.state;

    const messagesItems = messages.slice(0, numberOfMessages).map((message) => {
      return {
        key: message.id,
        id: message.id,
        text: message.text,
        type: message.type,
      };
    });

    // TODO: extract to a function
    const messageOverflowItems = messages
      .slice(numberOfMessages)
      .map((message) => {
        return {
          key: message.id,
          id: message.id,
          name: message.text,
          onRender: () => {
            return (
              <div className="flex flex-row items-center ml-2">
                <Label>{message.text}</Label>
                <IconButton
                  iconProps={{ iconName: "Cancel" }}
                  onClick={() =>
                    this.messagesDo(removeMessage, { id: message.id })
                  }
                />
              </div>
            );
          },
        };
      });

    const notebookPageContentStyle = {
      height: `calc(100% - 88px - ${messagesItems.length * 32}px - ${
        messageOverflowItems.length ? 32 : 0
      }px)`,
    };

    return (
      <NotebookPageController.Provider value={notebookPageController}>
        <div className="notebookPage">
          <RibbonComponent ribbonKey={ribbonKey} />

          <div>
            <OverflowSet
              vertical
              items={messagesItems}
              overflowItems={messageOverflowItems}
              onRenderItem={this.onRenderMessage}
              onRenderOverflowButton={this.onRenderMessageOverflow}
            />
          </div>

          <div className="notebookPageContent" style={notebookPageContentStyle}>
            {ribbonKey === "file" ? (
              <FileView />
            ) : (
              <NotebookComponent
                key={this.props.id}
                ref={this.notebookRef}
                notebook={this.props.notebook}
                notebookPath={this.props.notebookPath}
              />
            )}
          </div>
        </div>
      </NotebookPageController.Provider>
    );
  }
}
