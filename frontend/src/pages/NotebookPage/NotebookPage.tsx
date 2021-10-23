import React, { Component } from "react";
import { MessageBar, MessageBarType } from "@fluentui/react";
import { v4 as uuidv4 } from "uuid";

import RibbonComponent from "../../components/Ribbon/RibbonComponent";
import NotebookComponent from "../../components/Notebook/NotebookComponent";
import CommandBoxComponent from "../../components/CommandBoxComponent";

import { AppController } from "../../contexts/AppController";
import { NotebookPageController } from "../../contexts/NotebookPageController";

import "../../css/pages/NotebookPage.css";
import { INotebook } from "../../manipulation/NotebookManipulation";

interface NotebookPageProps {
  id: string;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

interface NotebookPageState {
  commandBoxShown: boolean;
  messageBars: JSX.Element[];
}

export default class NotebookPage extends Component<
  NotebookPageProps,
  NotebookPageState
> {
  static contextType = AppController;

  notebookRef: React.RefObject<NotebookComponent>;
  commandBoxRef: React.RefObject<CommandBoxComponent>;

  constructor(props: NotebookPageProps) {
    super(props);

    const { id } = props;

    this.showCommandBox = this.showCommandBox.bind(this);
    this.hideCommandBox = this.hideCommandBox.bind(this);
    this.addMessageBar = this.addMessageBar.bind(this);
    this.removeMessageBar = this.removeMessageBar.bind(this);
    this.getAppController = this.getAppController.bind(this);
    this.getNotebookRef = this.getNotebookRef.bind(this);

    this.notebookRef = React.createRef();
    this.commandBoxRef = React.createRef();

    this.state = {
      commandBoxShown: false,
      messageBars: [],
    };
  }

  showCommandBox() {
    this.setState((state) => {
      return { ...state, commandBoxShown: true };
    });
  }

  hideCommandBox() {
    this.setState((state) => {
      return { ...state, commandBoxShown: false };
    });
  }

  addMessageBar(text: string, type: MessageBarType) {
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

  removeMessageBar(id: string) {
    let messageBars = [...this.state.messageBars];
    messageBars = messageBars.filter(
      (messageBar) => messageBar.props.id !== id
    );

    this.setState((state) => {
      return { ...state, messageBars: messageBars };
    });
  }

  getNotebookRef() {
    return this.notebookRef;
  }

  getCommandBoxRef() {
    return this.commandBoxRef;
  }

  getAppController() {
    return this.context;
  }

  render() {
    const notebookPageContentStyle = {
      height: `calc(100% - 88px - ${this.state.messageBars.length * 32}px)`,
    };

    return (
      <NotebookPageController.Provider
        value={{
          showCommandBox: this.showCommandBox,
          hideCommandBox: this.hideCommandBox,
          addMessageBar: this.addMessageBar,
          removeMessageBar: this.removeMessageBar,
          getNotebookRef: this.getNotebookRef,
          getCommandBoxRef: this.getCommandBoxRef,
          getAppController: this.getAppController,
        }}
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
