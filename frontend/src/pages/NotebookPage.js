import React, { Component } from "react";
import RibbonComponent from "../components/Ribbon/RibbonComponent";
import NotebookComponent from "../components/Notebook/NotebookComponent";
import CommandBoxComponent from "../components/CommandBoxComponent";
import "../css/pages/NotebookPage.css";
import { MessageBar } from "@fluentui/react";
import { v4 as uuidv4 } from "uuid";

export default class NotebookPage extends Component {
  constructor(props) {
    super(props);

    this.showCommandBox = this.showCommandBox.bind(this);
    this.hideCommandBox = this.hideCommandBox.bind(this);
    this.addMessageBar = this.addMessageBar.bind(this);
    this.removeMessageBar = this.removeMessageBar.bind(this);

    const { id, appController, notebook, statusBarRef } = props;

    appController.setTabTitle(id, notebook.name);

    this.notebookRef = React.createRef();
    this.commandBoxRef = React.createRef();

    const pageController = {
      showCommandBox: this.showCommandBox,
      hideCommandBox: this.hideCommandBox,
      addMessageBar: this.addMessageBar,
      removeMessageBar: this.removeMessageBar,
    };

    this.state = {
      id: id,
      appController: appController,
      pageController: pageController,
      statusBarRef: statusBarRef,
      commandBoxShown: false,
      messageBars: [],
    };
  }

  /**
   *
   */
  showCommandBox() {
    this.setState((state) => {
      return { ...state, commandBoxShown: true };
    });
  }

  /**
   *
   */
  hideCommandBox() {
    this.setState((state) => {
      return { ...state, commandBoxShown: false };
    });
  }

  /**
   *
   * @param {*} text
   * @param {*} type
   */
  addMessageBar(text, type) {
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

  /**
   *
   * @param {*} id
   */
  removeMessageBar(id) {
    let messageBars = [...this.state.messageBars];
    messageBars = messageBars.filter(
      (messageBar) => messageBar.props.id !== id
    );

    this.setState((state) => {
      return { ...state, messageBars: messageBars };
    });
  }

  render() {
    const notebookPageContentStyle = {
      height: `calc(100% - 88px - ${this.state.messageBars.length * 32}px)`,
    };

    return (
      <div className="notebookPage">
        <RibbonComponent
          notebookRef={this.notebookRef}
          commandBoxRef={this.commandBoxRef}
          appController={this.state.appController}
          pageController={this.state.pageController}
          statusBarRef={this.state.statusBarRef}
        />

        <div>
          {this.state.messageBars.map((messageBar) => {
            return messageBar;
          })}
        </div>

        <div className="notebookPageContent" style={notebookPageContentStyle}>
          <NotebookComponent
            key={this.state.id}
            ref={this.notebookRef}
            appController={this.state.appController}
            pageController={this.state.pageController}
            statusBarRef={this.state.statusBarRef}
            tabId={this.state.id}
            notebook={this.props.notebook}
            notebookPath={this.props.notebookPath}
          />

          {this.state.commandBoxShown && (
            <CommandBoxComponent
              ref={this.commandBoxRef}
              notebookRef={this.notebookRef}
            />
          )}
        </div>
      </div>
    );
  }
}
