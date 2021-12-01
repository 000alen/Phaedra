import { MessageBarType } from "@fluentui/react";
import React from "react";
import { Subtract } from "utility-types";
import { v4 as uuidv4 } from "uuid";
import { INotebookTabController, NotebookTabController } from "../../contexts";
import { saveNotebook } from "../../IO/NotebookIO";

import { LayoutJSON } from "../../phaedra-layout/UseLayout/UseLayout";
import { getStrings } from "../../strings";
import { empty as emptyLayout } from "../../phaedra-layout/UseLayout/UseLayout";
import { empty as emptyContent } from "../../phaedra-content/UseContent/UseContent";

export interface ISource {
  id: string;
  content: string;
}

export interface IReference {
  id: string;
  sourceId: string;
}

export type IContent = object;

export type ILayout = LayoutJSON;

export interface IPage {
  id: string;
  references: IReference[];
  layout: ILayout;
  content: IContent;
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];
}

export interface UseNotebookProps {
  forwardedRef: React.Ref<any>;
  initialize?: (notebookManager: NotebookManager) => void;
  notebook?: INotebook;
  notebookPath?: string;
}

export interface UseNotebookState {}

export interface UseNotebookInjectedProps {
  _notebookManager: NotebookManager;
  _defaultNotebook: INotebook;
  _onContentChange: (pageId: string, content: IContent) => void;
  _onLayoutChange: (pageId: string, layout: ILayout) => void;
}

type Props<P extends UseNotebookInjectedProps> = Subtract<
  P & UseNotebookProps,
  UseNotebookInjectedProps
>;

export interface NotebookManager {
  save(): Promise<void>;
  getSources(): ISource[];
  getSource(id: string): ISource | undefined;
  getPages(): IPage[];
  getPage(id: string): IPage | undefined;
  getPageReferences(pageId: string): IReference[] | undefined;
  getPageReference(pageId: string, referenceId: string): IReference | undefined;
  getPageLayout(pageId: string): ILayout | undefined;
  getPageContent(pageId: string): IContent | undefined;
  addPage(page: IPage, callback?: () => void): void;
  insertPage(page: IPage, index: number, callback?: () => void): void;
  removePage(id: string, callback?: () => void): void;
}

type PropsWithoutRef<P extends UseNotebookInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export function emptyPage() {
  return {
    id: uuidv4(),
    references: [],
    layout: emptyLayout(),
    content: emptyContent(),
  };
}

export function empty() {
  const id = uuidv4();

  return {
    id,
    name: `Unnamed Notebook ${id}`,
    sources: [],
    pages: [emptyPage()],
  } as INotebook;
}

export function UseNotebook<P extends UseNotebookInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithNotebook
    extends React.Component<Props<P>, UseNotebookState>
    implements NotebookManager
  {
    static contextType = NotebookTabController;

    notebook: INotebook;
    notebookPath: string | undefined;
    saved: boolean;

    constructor(props: Props<P>) {
      super(props);

      this.getSources = this.getSources.bind(this);
      this.getSource = this.getSource.bind(this);
      this.getPages = this.getPages.bind(this);
      this.getPage = this.getPage.bind(this);
      this.getPageReferences = this.getPageReferences.bind(this);
      this.getPageReference = this.getPageReference.bind(this);
      this.getPageLayout = this.getPageLayout.bind(this);
      this.getPageContent = this.getPageContent.bind(this);
      this.addPage = this.addPage.bind(this);
      this.insertPage = this.insertPage.bind(this);
      this.removePage = this.removePage.bind(this);
      this.onContentChange = this.onContentChange.bind(this);
      this.onLayoutChange = this.onLayoutChange.bind(this);

      const { initialize, notebook, notebookPath } = props;

      if (initialize) initialize(this);

      this.notebook = notebook !== undefined ? notebook : empty();
      this.notebookPath = notebookPath;
      this.saved = notebookPath !== undefined ? true : false;
    }

    // componentDidMount() {
    //   const notebookTabController: INotebookTabController = this.context;
    //   const appController: IAppController =
    //     notebookTabController.getAppController()!;
    //   const tabId = notebookTabController.getTabId()!;
    //   const { notebook } = this.state;

    //   appController.tabsManager!.setTitle(tabId, notebook.name);
    // }

    async save() {
      const notebookTabController: INotebookTabController = this.context;
      const appController = notebookTabController.getAppController()!;

      const taskId = uuidv4();
      appController.tasksManager!.add({
        id: taskId,
        name: getStrings().savingNotebookTaskLabel,
      });

      try {
        const finalNotebookPath = await saveNotebook(
          this.notebook,
          this.notebookPath
        );
        this.notebookPath = finalNotebookPath;
        this.saved = true;
      } catch (error) {
        appController.messagesManager!.add({
          id: uuidv4(),
          text: getStrings().savingNotebookTaskError,
          type: MessageBarType.error,
        });
      } finally {
        appController.tasksManager!.remove(taskId);
      }
    }

    getSources() {
      return this.notebook.sources;
    }

    getSource(id: string) {
      return this.notebook.sources.find((source) => source.id === id);
    }

    getPages() {
      return this.notebook.pages;
    }

    getPage(id: string) {
      return this.notebook.pages.find((page) => page.id === id);
    }

    getPageReferences(pageId: string) {
      return this.getPage(pageId)?.references;
    }

    getPageReference(pageId: string, referenceId: string) {
      return this.getPage(pageId)?.references.find(
        (reference) => reference.id === referenceId
      );
    }

    getPageLayout(id: string) {
      return this.getPage(id)?.layout;
    }

    getPageContent(id: string) {
      return this.getPage(id)?.content;
    }

    // * Forces update
    addPage(page: IPage, callback?: () => void) {
      this.notebook.pages.push(page);
      this.saved = false;
      this.forceUpdate(callback);
    }

    // * Forces update
    insertPage(page: IPage, index: number, callback?: () => void) {
      this.notebook.pages.splice(index, 0, page);
      this.saved = false;
      this.forceUpdate(callback);
    }

    // * Forces update
    removePage(id: string, callback?: () => void) {
      const index = this.notebook.pages.findIndex((page) => page.id === id);
      if (index === -1) return;
      this.notebook.pages.splice(index, 1);
      this.saved = false;
      this.forceUpdate(callback);
    }

    // * Does not force update
    onContentChange(pageId: string, content: IContent) {
      this.getPage(pageId)!.content = content;
      this.saved = false;
    }

    // * Does not force update
    onLayoutChange(pageId: string, layout: ILayout) {
      this.getPage(pageId)!.layout = layout;
      this.saved = false;
    }

    render() {
      const { forwardedRef, ...rest } = this.props;
      return (
        <Component
          {...(rest as P)}
          ref={forwardedRef}
          _notebookManager={this}
          _defaultNotebook={this.notebook}
          _onContentChange={this.onContentChange}
          _onLayoutChange={this.onLayoutChange}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithNotebook {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
