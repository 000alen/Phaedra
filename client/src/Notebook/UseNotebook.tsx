import { MessageBarType } from "@fluentui/react";
import React from "react";
import { Subtract } from "utility-types";
import { v4 as uuidv4 } from "uuid";
import {
  IAppController,
  INotebookTabController,
  NotebookTabController,
} from "../contexts";
import { saveNotebook } from "./IO";

import { getStrings } from "../strings";
import { empty as emptyLayout } from "../Layout/UseLayout/UseLayout";
import { empty as emptyContent } from "../Content/UseContent/UseContent";
import {
  IContent,
  ILayout,
  INotebook,
  IPage,
  IQuill,
  IReference,
  ISource,
} from "./Notebook";

export interface UseNotebookProps {
  forwardedRef: React.Ref<any>;
  initialize?: (notebookManager: NotebookManager) => void;
  notebookTabController: INotebookTabController;
  notebook?: INotebook;
  notebookPath?: string;
}

export interface UseNotebookState {}

export interface UseNotebookInjectedProps {
  _notebookManager: NotebookManager;
  _defaultNotebook: INotebook;
  _onContentChange: (pageId: string, content: IContent) => void;
  _onLayoutChange: (pageId: string, layout: ILayout) => void;
  _onQuillChange: (pageId: string, quillId: string, content: IContent) => void;
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
  getPageQuills(pageId: string): IQuill[] | undefined;
  getPageQuill(pageId: string, quillId: string): IQuill | undefined;
  addPageReference(
    pageId: string,
    reference: IReference,
    callback?: () => void
  ): void;
  addPageQuill(pageId: string, quill: IQuill, callback?: () => void): void;
  addPage(page: IPage, callback?: () => void): void;
  insertPage(page: IPage, index: number, callback?: () => void): void;
  removePage(id: string, callback?: () => void): void;
}

type PropsWithoutRef<P extends UseNotebookInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export function emptyQuill(): IQuill {
  return {
    id: uuidv4(),
    content: emptyContent(),
  };
}

export function emptyPage(): IPage {
  return {
    id: uuidv4(),
    references: [],
    layout: emptyLayout(),
    content: emptyContent(),
    quills: [],
  };
}

export function empty(): INotebook {
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
      this.getPageQuills = this.getPageQuills.bind(this);
      this.addPageReference = this.addPageReference.bind(this);
      this.getPageQuill = this.getPageQuill.bind(this);
      this.addPageQuill = this.addPageQuill.bind(this);
      this.addPage = this.addPage.bind(this);
      this.insertPage = this.insertPage.bind(this);
      this.removePage = this.removePage.bind(this);
      this.onContentChange = this.onContentChange.bind(this);
      this.onLayoutChange = this.onLayoutChange.bind(this);
      this.onQuillChange = this.onQuillChange.bind(this);

      const { initialize, notebook, notebookPath } = props;

      if (initialize) initialize(this);

      this.notebook = notebook !== undefined ? notebook : empty();
      this.notebookPath = notebookPath;
      this.saved = notebookPath !== undefined ? true : false;
    }

    componentDidMount() {
      const notebookTabController: INotebookTabController = this.context;
      const appController: IAppController =
        notebookTabController.getAppController()!;
      const tabId = notebookTabController.getTabId()!;
      appController.tabsManager!.setTitle(tabId, this.notebook.name);
    }

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
        notebookTabController.setDirty(false);
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

    getPageQuills(pageId: string) {
      return this.getPage(pageId)?.quills;
    }

    getPageQuill(pageId: string, quillId: string) {
      return this.getPage(pageId)?.quills.find((quill) => quill.id === quillId);
    }

    // * Forces update
    addPageReference(
      pageId: string,
      reference: IReference,
      callback?: () => void
    ) {
      const page = this.getPage(pageId)!;
      page.references.push(reference);
      this.forceUpdate(callback);
    }

    // * Forces update
    addPageQuill(pageId: string, quill: IQuill, callback?: () => void) {
      const page = this.getPage(pageId)!;
      page.quills.push(quill);
      this.saved = false;
      this.forceUpdate(callback);
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
      const { notebookTabController } = this.props;
      this.getPage(pageId)!.content = content;
      this.saved = false;
      notebookTabController.setDirty(true);
    }

    // * Does not force update
    onLayoutChange(pageId: string, layout: ILayout) {
      const { notebookTabController } = this.props;
      this.getPage(pageId)!.layout = layout;
      this.saved = false;
      notebookTabController.setDirty(true);
    }

    // * Does not force update
    onQuillChange(pageId: string, quillId: string, content: IContent) {
      const { notebookTabController } = this.props;
      this.getPageQuill(pageId, quillId)!.content = content;
      this.saved = false;
      notebookTabController.setDirty(true);
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
          _onQuillChange={this.onQuillChange}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithNotebook {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
