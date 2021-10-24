import "../css/pages/NotebookPage.css";

import React, { Component } from "react";

import CommandBoxComponent from "../components/CommandBoxComponent";
import NotebookComponent from "../components/Notebook/NotebookComponent";
import RibbonComponent from "../components/Ribbon/RibbonComponent";
import { AppController } from "../contexts/AppController";
import { IAppController } from "../contexts/IAppController";
import { NotebookPageController } from "../contexts/NotebookPageController";
import {
  IMessagesCommand,
  IMessagesManipulation,
} from "../manipulation/IMessagesManipulation";
import { populateMessages } from "../manipulation/MessagesManipulation";
import { NotebookPageProps, NotebookPageState } from "./INotebookPage";

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
    this.getNotebookRef = this.getNotebookRef.bind(this);

    this.notebookRef = React.createRef();
    this.commandBoxRef = React.createRef();

    this.state = {
      messages: [],
      commandBoxShown: false,
      notebookPageController: {
        messagesDo: this.messagesDo,
        showCommandBox: this.showCommandBox,
        hideCommandBox: this.hideCommandBox,
        getAppController: this.getAppController,
        getCommandBoxRef: this.getCommandBoxRef,
        getNotebookRef: this.getNotebookRef,
      },
    };
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

  getNotebookRef(): React.RefObject<NotebookComponent> {
    return this.notebookRef;
  }

  getCommandBoxRef(): React.RefObject<CommandBoxComponent> {
    return this.commandBoxRef;
  }

  getAppController(): IAppController {
    return this.context;
  }

  render(): JSX.Element {
    const notebookPageContentStyle = {
      height: `calc(100% - 88px - ${this.state.messages.length * 32}px)`,
    };

    return (
      <NotebookPageController.Provider
        value={this.state.notebookPageController}
      >
        <div className="notebookPage">
          <RibbonComponent />

          <div>{populateMessages(this.state.messages, this.messagesDo)}</div>

          <div className="notebookPageContent" style={notebookPageContentStyle}>
            <NotebookComponent
              key={this.props.id}
              ref={this.notebookRef}
              tabId={this.props.id}
              notebook={this.props.notebook}
              notebookPath={this.props.notebookPath}
            />

            {this.state.commandBoxShown && (
              <CommandBoxComponent ref={this.commandBoxRef} />
            )}
          </div>
        </div>
      </NotebookPageController.Provider>
    );
  }
}
