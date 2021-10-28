import "../../css/pages/NotebookPage.css";

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

import CommandBoxComponent from "../../components/CommandBoxComponent";
import NotebookComponent from "../../components/Notebook/NotebookComponent";
import { RibbonComponent } from "../../components/Ribbon/RibbonComponent";
import { AppController } from "../../contexts/AppController";
import { IAppController } from "../../contexts/IAppController";
import { INotebookController } from "../../contexts/INotebookController";
import { NotebookPageController } from "../../contexts/NotebookPageController";
import {
  IMessagesCommand,
  IMessagesManipulation,
} from "../../manipulation/IMessagesManipulation";
import { removeMessage } from "../../manipulation/MessagesManipulation";
import { NotebookPageShortcuts } from "../../shortcuts/NotebookPageShortcuts";
import { NotebookPageProps, NotebookPageState } from "./INotebookPage";
import { FileView } from "./views/FileView";

const numberOfMessages = 3;

export default class NotebookPage extends Component<
  NotebookPageProps,
  NotebookPageState
> {
  static contextType = AppController;

  notebookRef: React.RefObject<NotebookComponent>;
  commandBoxRef: React.RefObject<CommandBoxComponent>;

  constructor(props: NotebookPageProps) {
    super(props);

    this.messagesDo = this.messagesDo.bind(this);
    this.showCommandBox = this.showCommandBox.bind(this);
    this.hideCommandBox = this.hideCommandBox.bind(this);
    this.getAppController = this.getAppController.bind(this);
    this.getCommandBoxRef = this.getCommandBoxRef.bind(this);
    this.getNotebookController = this.getNotebookController.bind(this);
    this.getRibbonKey = this.getRibbonKey.bind(this);
    this.setRibbonKey = this.setRibbonKey.bind(this);

    this.onRenderMessage = this.onRenderMessage.bind(this);
    this.onRenderMessageOverflow = this.onRenderMessageOverflow.bind(this);

    this.notebookRef = React.createRef();
    this.commandBoxRef = React.createRef();

    this.state = {
      messages: [],
      ribbonKey: "home",
      commandBoxShown: false,
      notebookPageController: {
        messagesDo: this.messagesDo,
        showCommandBox: this.showCommandBox,
        hideCommandBox: this.hideCommandBox,
        getAppController: this.getAppController,
        getCommandBoxRef: this.getCommandBoxRef,
        getNotebookController: this.getNotebookController,
        getRibbonKey: this.getRibbonKey,
        setRibbonKey: this.setRibbonKey,
      },
    };
  }

  componentDidMount(): void {
    for (const [keys, action] of Object.entries(NotebookPageShortcuts)) {
      Mousetrap.bind(
        keys,
        (event) => {
          action(this.state.notebookPageController);
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

  messagesDo(manipulation: IMessagesManipulation, args: IMessagesCommand) {
    const messages = this.state.messages;
    const currentMessages = manipulation(messages, args);

    this.setState((state) => {
      return {
        ...state,
        messages: currentMessages,
      };
    });
  }

  showCommandBox(): void {
    this.setState((state) => {
      return { ...state, commandBoxShown: true };
    });
  }

  hideCommandBox(): void {
    this.setState((state) => {
      return { ...state, commandBoxShown: false };
    });
  }

  getCommandBoxRef(): React.RefObject<CommandBoxComponent> {
    return this.commandBoxRef;
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
    const { messages } = this.state;

    const messagesItems = messages.slice(0, numberOfMessages).map((message) => {
      return {
        key: message.id,
        id: message.id,
        text: message.text,
        type: message.type,
      };
    });

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
      <NotebookPageController.Provider
        value={this.state.notebookPageController}
      >
        <div className="notebookPage">
          <RibbonComponent ribbonKey={this.state.ribbonKey} />

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
            {this.state.ribbonKey === "file" ? (
              <FileView />
            ) : (
              <NotebookComponent
                key={this.props.id}
                ref={this.notebookRef}
                tabId={this.props.id}
                notebook={this.props.notebook}
                notebookPath={this.props.notebookPath}
              />
            )}

            {this.state.commandBoxShown && (
              <CommandBoxComponent ref={this.commandBoxRef} />
            )}
          </div>
        </div>
      </NotebookPageController.Provider>
    );
  }
}
