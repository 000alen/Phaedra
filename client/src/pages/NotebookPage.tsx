import Mousetrap from "mousetrap";
import React, { Component } from "react";

import { ColaborationPanel } from "../components/ColaborationPanel";
import { Notebook } from "../components/Notebook";
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
  colaborationPanelShown: boolean;
}

export interface NotebookPageViewProps {}

export class NotebookPage extends Component<
  NotebookPageProps,
  NotebookPageState
> {
  static contextType = AppController;

  notebookRef: React.RefObject<Notebook>;

  constructor(props: NotebookPageProps) {
    super(props);

    this.getAppController = this.getAppController.bind(this);
    this.getNotebookController = this.getNotebookController.bind(this);
    this.showColaborationPanel = this.showColaborationPanel.bind(this);
    this.hideColaborationPanel = this.hideColaborationPanel.bind(this);
    this.isColaborationPanelShown = this.isColaborationPanelShown.bind(this);

    this.notebookRef = React.createRef();

    this.state = {
      colaborationPanelShown: false,
      notebookPageController: {
        getAppController: this.getAppController,
        getNotebookController: this.getNotebookController,
        showColaborationPanel: this.showColaborationPanel,
        hideColaborationPanel: this.hideColaborationPanel,
        isColaborationPanelShown: this.isColaborationPanelShown,
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

  showColaborationPanel(): void {
    this.setState((state) => {
      return {
        ...state,
        colaborationPanelShown: true,
      };
    });
  }

  hideColaborationPanel(): void {
    this.setState((state) => {
      return {
        ...state,
        colaborationPanelShown: false,
      };
    });
  }

  isColaborationPanelShown(): boolean {
    return this.state.colaborationPanelShown;
  }

  render(): JSX.Element {
    const { colaborationPanelShown, notebookPageController } = this.state;

    return (
      <NotebookPageController.Provider value={notebookPageController}>
        <div className="fill-parent">
          <Notebook
            key={this.props.id}
            ref={this.notebookRef}
            notebook={this.props.notebook}
            notebookPath={this.props.notebookPath}
          />
        </div>

        <ColaborationPanel
          colaborationPanelShown={colaborationPanelShown}
          hideColaborationPanel={this.hideColaborationPanel}
        />
      </NotebookPageController.Provider>
    );
  }
}
