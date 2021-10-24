import "../../css/pages/NotebookPage.css";

import React, { Component } from "react";

import { PivotItem } from "@fluentui/react";

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
import { populateMessages } from "../../manipulation/MessagesManipulation";
import { NotebookPageProps, NotebookPageState } from "./INotebookPage";
import { FileView } from "./views/FileView";

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

  render(): JSX.Element {
    const notebookPageContentStyle = {
      height: `calc(100% - 88px - ${this.state.messages.length * 32}px)`,
    };

    return (
      <NotebookPageController.Provider
        value={this.state.notebookPageController}
      >
        <div className="notebookPage">
          <RibbonComponent ribbonKey={this.state.ribbonKey} />

          <div>{populateMessages(this.state.messages, this.messagesDo)}</div>

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
