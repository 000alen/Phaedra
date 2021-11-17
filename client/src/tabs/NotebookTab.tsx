import Mousetrap from "mousetrap";
import React, { Component } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  DefaultButton,
  DialogFooter,
  DialogType,
  PrimaryButton,
} from "@fluentui/react";

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

export interface NotebookTabProps {
  tabId: string;
  tabRef: (ref: any) => void;
  notebook: INotebook;
  notebookPath?: string | undefined;
}

export interface NotebookTabState {
  colaborationPanelShown: boolean;
  notebookPageController: INotebookPageController;
}

export class NotebookTab extends Component<NotebookTabProps, NotebookTabState> {
  static contextType = AppController;

  notebookRef: React.RefObject<Notebook>;

  constructor(props: NotebookTabProps) {
    super(props);

    this.getAppController = this.getAppController.bind(this);
    this.getNotebookController = this.getNotebookController.bind(this);
    this.getTabId = this.getTabId.bind(this);
    this.showColaborationPanel = this.showColaborationPanel.bind(this);
    this.hideColaborationPanel = this.hideColaborationPanel.bind(this);
    this.isColaborationPanelShown = this.isColaborationPanelShown.bind(this);

    this.notebookRef = React.createRef();

    this.state = {
      colaborationPanelShown: false,
      notebookPageController: {
        getAppController: this.getAppController,
        getNotebookController: this.getNotebookController,
        getTabId: this.getTabId,
        showColaborationPanel: this.showColaborationPanel,
        hideColaborationPanel: this.hideColaborationPanel,
        isColaborationPanelShown: this.isColaborationPanelShown,
      },
    };
  }

  componentDidMount(): void {
    const { tabRef } = this.props;
    const { notebookPageController } = this.state;

    tabRef(this);

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
    const { tabRef } = this.props;

    tabRef(undefined);

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

  getTabId(): string {
    return this.props.tabId;
  }

  handleDirt() {
    const appController: IAppController = this.context;
    const { notebook } = this.props;

    const dialogId = uuidv4();

    // appController.addDialog({
    //   id: dialogId,
    //   title: "Save changes?",
    //   subText: notebook.name,
    //   type: DialogType.normal,
    //   visible: true,
    //   onDismiss: () => {
    //     appController.removeDialog(dialogId);
    //   },
    //   footer: (
    //     <DialogFooter>
    //       <DefaultButton
    //         text="Cancel"
    //         onClick={() => {
    //           appController.removeDialog(dialogId);
    //         }}
    //       />
    //       <DefaultButton
    //         text="Do not save"
    //         onClick={() => {
    //           appController.removeDialog(dialogId, () => {
    //             appController.setTabDirty(this.getTabId(), false, () => {
    //               appController.closeTab(this.getTabId());
    //             });
    //           });
    //         }}
    //       />
    //       <PrimaryButton
    //         text="Save"
    //         onClick={() => {
    //           appController.removeDialog(dialogId, () => {
    //             this.getNotebookController()
    //               .save()
    //               .then(() => {
    //                 appController.closeTab(this.getTabId());
    //               });
    //           });
    //         }}
    //       />
    //     </DialogFooter>
    //   ),
    // });
  }

  render(): JSX.Element {
    const { colaborationPanelShown, notebookPageController } = this.state;

    return (
      <NotebookPageController.Provider value={notebookPageController}>
        <div className="w-[100%] h-[100%]">
          <Notebook
            key={this.props.tabId}
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
