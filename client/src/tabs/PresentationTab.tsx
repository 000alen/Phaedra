import {
  DefaultButton,
  DialogFooter,
  DialogType,
  IconButton,
  PrimaryButton,
} from "@fluentui/react";
import React from "react";
import { Page } from "../components/Page/Page";
import {
  AppController,
  IAppController,
  INotebookTabController,
  NotebookTabController,
} from "../contexts";
import { setFullscreen } from "../electron";
import {
  NotebookManager,
  UseNotebook,
  UseNotebookInjectedProps,
} from "../Notebook/UseNotebook";
import { getTheme } from "../themes";
import { v4 as uuidv4 } from "uuid";
import { IShortcut, UseShortcuts } from "../HOC/UseShortcuts";
import { NotebookTab } from "./NotebookTab";

type PresentationTabSkeletonProps = TabProps & UseNotebookInjectedProps;

interface PresentationTabSkeletonState {
  index: number;
  notebookTabController: INotebookTabController;
}

export class PresentationTabSkeleton extends React.Component<
  PresentationTabSkeletonProps,
  PresentationTabSkeletonState
> {
  static contextType = AppController;

  constructor(props: TabProps & UseNotebookInjectedProps) {
    super(props);

    this.getAppController = this.getAppController.bind(this);
    this.getTabId = this.getTabId.bind(this);
    this.getNotebookManager = this.getNotebookManager.bind(this);
    this.isDirty = this.isDirty.bind(this);
    this.setDirty = this.setDirty.bind(this);
    this.handleDirt = this.handleDirt.bind(this);

    this.increaseIndex = this.increaseIndex.bind(this);
    this.decreaseIndex = this.decreaseIndex.bind(this);

    this.state = {
      index: 0,
      notebookTabController: {
        isDirty: this.isDirty,
        setDirty: this.setDirty,
        handleDirt: this.handleDirt,
        getAppController: this.getAppController,
        getTabId: this.getTabId,
        getNotebookManager: this.getNotebookManager,
      },
    };
  }

  componentDidMount() {
    const appController: IAppController = this.context;
    const { setActiveTabRef, tabId, _defaultNotebook } = this.props;
    setActiveTabRef(this);

    appController.setTabTitle(tabId, `Presentation: ${_defaultNotebook.name}`);

    setFullscreen(true);
  }

  componentWillUnmount() {
    const { setActiveTabRef } = this.props;
    setActiveTabRef(undefined);

    setFullscreen(false);
  }

  getAppController(): IAppController {
    return this.context;
  }
  getTabId(): string {
    return this.props.tabId;
  }

  getNotebookManager(): NotebookManager | undefined {
    const { _notebookManager } = this.props;
    return _notebookManager;
  }

  isDirty() {
    const { tabId } = this.props;
    const appController = this.getAppController();
    const tab = appController.getTab(tabId)!;
    return tab?.dirty;
  }

  setDirty(dirty: boolean) {
    if (dirty === this.isDirty()) return;

    const { tabId } = this.props;
    const appController = this.getAppController();
    appController.setTabDirty(tabId, dirty);
  }

  handleDirt(callback?: () => void): void {
    const appController: IAppController = this.context;
    const { _notebookManager, _defaultNotebook } = this.props;

    const dialogId = uuidv4();

    appController.addDialog({
      id: dialogId,
      title: "Save changes?",
      subText: _defaultNotebook.name,
      type: DialogType.normal,
      visible: true,
      onDismiss: () => {
        appController.removeDialog(dialogId);
      },
      footer: (
        <DialogFooter>
          <DefaultButton
            text="Cancel"
            onClick={() => {
              appController.removeDialog(dialogId);
            }}
          />
          <DefaultButton
            text="Do not save"
            onClick={() => {
              appController.removeDialog(dialogId, () => {
                appController.setTabDirty(this.getTabId(), false, () => {
                  appController.removeTab(this.getTabId());
                });
              });
            }}
          />
          <PrimaryButton
            text="Save"
            onClick={() => {
              appController.removeDialog(dialogId, () => {
                _notebookManager!.save().then(() => {
                  appController.removeTab(this.getTabId());
                });
              });
            }}
          />
        </DialogFooter>
      ),
    });
  }

  handleExit() {
    const appController: IAppController = this.context;
    const { tabId, _notebookManager } = this.props;
    appController.setTabComponent(tabId, NotebookTab, {
      notebook: _notebookManager?.notebook,
    });
  }

  increaseIndex() {
    this.setState(({ index }) => ({ index: index + 1 }));
  }

  decreaseIndex() {
    this.setState(({ index }) => ({ index: index > 0 ? index - 1 : index }));
  }

  render() {
    const {
      _notebookManager,
      _defaultNotebook,
      _onLayoutChange,
      _onContentChange,
      _onQuillChange,
    } = this.props;
    const { index, notebookTabController } = this.state;

    const containerStyle = {
      backgroundColor: getTheme().palette.neutralLight,
    };

    const page = _defaultNotebook.pages[index % _defaultNotebook.pages.length];

    return (
      <NotebookTabController.Provider value={notebookTabController}>
        <div className="absolute inset-0" style={containerStyle}>
          <Page
            key={page.id}
            id={page.id}
            page={page}
            _notebookManager={_notebookManager}
            _onLayoutChange={_onLayoutChange}
            _onContentChange={_onContentChange}
            _onQuillChange={_onQuillChange}
          />
          <div className="absolute flex flex-row align-middle bottom-5 right-5">
            <IconButton
              iconProps={{ iconName: "ChromeBack" }}
              onClick={this.decreaseIndex}
            />
            <IconButton
              iconProps={{ iconName: "ChromeBackMirrored" }}
              onClick={this.increaseIndex}
            />
          </div>
        </div>
      </NotebookTabController.Provider>
    );
  }
}

export const PresentationTabShortcuts: IShortcut<PresentationTabSkeleton>[] = [
  {
    keys: "esc",
    description: "Close presentation mode.",
    action: (presentationTabRef: React.RefObject<PresentationTabSkeleton>) => {
      presentationTabRef.current?.handleExit();
    },
  },
];

export const PresentationTab = UseShortcuts(
  UseNotebook(PresentationTabSkeleton),
  PresentationTabShortcuts
);
