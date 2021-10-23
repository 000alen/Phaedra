// TODO: Refactor MessageBar API

import "../css/pages/NotebookPage.css";

import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import { MessageBar, MessageBarType } from "@fluentui/react";

import CommandBoxComponent from "../components/CommandBoxComponent";
import NotebookComponent from "../components/Notebook/NotebookComponent";
import RibbonComponent from "../components/Ribbon/RibbonComponent";
import { AppController } from "../contexts/AppController";
import { IAppController } from "../contexts/IAppController";
import { NotebookPageController } from "../contexts/NotebookPageController";
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

    this.showCommandBox = this.showCommandBox.bind(this);
    this.hideCommandBox = this.hideCommandBox.bind(this);
    this.addMessageBar = this.addMessageBar.bind(this);
    this.removeMessageBar = this.removeMessageBar.bind(this);
    this.getAppController = this.getAppController.bind(this);
    this.getCommandBoxRef = this.getCommandBoxRef.bind(this);
    this.getNotebookRef = this.getNotebookRef.bind(this);

    this.notebookRef = React.createRef();
    this.commandBoxRef = React.createRef();

    this.state = {
      commandBoxShown: false,
      messageBars: [],
      notebookPageController: {
        showCommandBox: this.showCommandBox,
        hideCommandBox: this.hideCommandBox,
        addMessageBar: this.addMessageBar,
        removeMessageBar: this.removeMessageBar,
        getAppController: this.getAppController,
        getCommandBoxRef: this.getCommandBoxRef,
        getNotebookRef: this.getNotebookRef,
      },
    };
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

  addMessageBar(text: string, type: MessageBarType): void {
    const id = uuidv4();
    let messageBars = [...this.state.messageBars];
    messageBars.push(
      <MessageBar
        key={id}
        id={id}
        isMultiline={false}
        messageBarType={type}
        onDismiss={() => {
          this.removeMessageBar(id);
        }}
      >
        {text}
      </MessageBar>
    );

    this.setState((state) => {
      return { ...state, messageBars: messageBars };
    });
  }

  removeMessageBar(id: string): void {
    let messageBars = [...this.state.messageBars];
    messageBars = messageBars.filter(
      (messageBar) => messageBar.props.id !== id
    );

    this.setState((state) => {
      return { ...state, messageBars: messageBars };
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
      height: `calc(100% - 88px - ${this.state.messageBars.length * 32}px)`,
    };

    return (
      <NotebookPageController.Provider
        value={this.state.notebookPageController}
      >
        <div className="notebookPage">
          <RibbonComponent />

          <div>
            {this.state.messageBars.map((messageBar) => {
              return messageBar;
            })}
          </div>

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
