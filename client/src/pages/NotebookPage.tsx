import Mousetrap from "mousetrap";
import React, { Component } from "react";

import NotebookComponent from "../components/NotebookComponent";
import { AppController, IAppController } from "../contexts/AppController";
import { INotebookController } from "../contexts/NotebookController";
import {
  INotebookPageController,
  NotebookPageController,
} from "../contexts/NotebookPageController";
import { NotebookPageShortcuts } from "../shortcuts/NotebookPageShortcuts";
import { INotebook } from "../structures/NotebookStructure";

export interface NotebookPageProps {
  id: string;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookPageState {
  notebookPageController: INotebookPageController;
}

export interface NotebookPageViewProps {}

export default class NotebookPage extends Component<
  NotebookPageProps,
  NotebookPageState
> {
  static contextType = AppController;

  notebookRef: React.RefObject<NotebookComponent>;

  constructor(props: NotebookPageProps) {
    super(props);

    this.getAppController = this.getAppController.bind(this);
    this.getNotebookController = this.getNotebookController.bind(this);

    this.notebookRef = React.createRef();

    this.state = {
      notebookPageController: {
        getAppController: this.getAppController,
        getNotebookController: this.getNotebookController,
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

  getAppController(): IAppController {
    return this.context;
  }

  getNotebookController(): INotebookController {
    return this.notebookRef.current!.state.notebookController!;
  }

  render(): JSX.Element {
    const { notebookPageController } = this.state;
    return (
      <NotebookPageController.Provider value={notebookPageController}>
        <div className="fill-parent overflow-y-auto overflow-x-hidden">
          {/* <div className="notebookPageContent"> */}
          <NotebookComponent
            key={this.props.id}
            ref={this.notebookRef}
            notebook={this.props.notebook}
            notebookPath={this.props.notebookPath}
          />
          {/* </div> */}
        </div>
      </NotebookPageController.Provider>
    );
  }
}
