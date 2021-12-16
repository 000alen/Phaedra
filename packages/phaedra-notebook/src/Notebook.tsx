import generateName from "project-name-generator";
import { v4 as uuidv4 } from "uuid";

export type IDirection = "north" | "south" | "east" | "west";

export type IOrientation = "horizontal" | "vertical";

export interface ISource {
  id: string;
  title: string;
  type: string;
  content: string;
  path?: string;
  index?: number;
}

export interface IReference {
  id: string;
  title: string;
  sourceId: string;
}

export interface IPaneProps {
  type: string;
  paramId?: string | undefined;
}

export interface IPane {
  type: "pane";
  id: string;
  position: number;
  size: number;
  previous: string | null;
  next: string | null;
  props: IPaneProps;
}

export interface ILayout {
  type: "layout";
  id: string;
  position: number;
  size: number;
  orientation: IOrientation;
  previous: string | null;
  next: string | null;
  children: (ILayout | IPane)[];
}

export interface IContent {
  ops: object[];
}

export interface IQuill {
  id: string;
  content: IContent;
}

export interface IPage {
  id: string;
  references: IReference[];
  layout: ILayout;
  content: IContent;
  quills: IQuill[];
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];
}

export interface ILayoutController {
  splitPageLayoutPane: (
    pageId: string,
    paneId: string,
    edge: IDirection,
    relativeSize: number
  ) => void;
  resizePageLayoutPane: (
    pageId: string,
    paneId: string,
    edge: IDirection,
    size: number
  ) => void;
  removePageLayoutPane: (pageId: string, paneId: string) => void;
}

export class Notebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];

  constructor({ id, name, sources, pages }: Partial<INotebook>) {
    this.id = id || uuidv4();
    this.name = name || generateName().spaced;
    this.sources = sources || [];
    this.pages = pages || [];
  }

  JSON() {
    return {
      id: this.id,
      name: this.name,
      sources: this.sources,
      pages: this.pages
    };
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getSources() {
    return this.sources;
  }

  getPages() {
    return this.pages;
  }

  getSource(sourceId: string) {
    return this.sources.find((source) => source.id === sourceId);
  }

  getPage(pageId: string) {
    return this.pages.find((page) => page.id === pageId);
  }

  getPageReferences(pageId: string) {
    return this.getPage(pageId)?.references;
  }

  getPageLayout(pageId: string) {
    return this.getPage(pageId)?.layout;
  }

  getPageLayoutPanes(pageId: string) {
    throw new Error("Not implemented");
  }

  getPageContent(pageId: string) {
    return this.getPage(pageId)?.content;
  }

  getPageQuills(pageId: string) {
    return this.getPage(pageId)?.quills;
  }

  getPageReference(pageId: string, referenceId: string) {
    return this.getPageReferences(pageId)?.find(
      (reference) => reference.id === referenceId
    );
  }

  getPageLayoutPane(pageId: string, paneId: string) {
    throw new Error("Not implemented");
  }

  getPageQuill(pageId: string, quillId: string) {
    return this.getPageQuills(pageId)?.find((quill) => quill.id === quillId);
  }

  addSource(source: ISource) {
    this.sources.push(source);
  }

  addPage(page: IPage) {
    this.pages.push(page);
  }

  addPageReference(pageId: string, reference: IReference) {
    this.getPage(pageId)?.references.push(reference);
  }

  addPageQuill(pageId: string, quill: IQuill) {
    this.getPageQuills(pageId)?.push(quill);
  }

  removeSource(sourceId: string) {
    this.sources = this.sources.filter((source) => source.id !== sourceId);
  }

  removePage(pageId: string) {
    this.pages = this.pages.filter((page) => page.id !== pageId);
  }

  removePageReference(pageId: string, referenceId: string) {
    const page = this.getPage(pageId);
    if (page)
      page.references = page.references.filter(
        (reference) => reference.id !== referenceId
      );
  }

  removePageLayoutPane(pageId: string, paneId: string) {
    throw new Error("Not implemented");
  }

  removePageQuill(pageId: string, quillId: string) {
    const page = this.getPage(pageId);
    if (page) page.quills = page.quills.filter((quill) => quill.id !== quillId);
  }

  rename(name: string) {
    this.name = name;
  }

  editPageContent(pageId: string, operation: object) {
    const page = this.getPage(pageId);
    if (page) page.content.ops.push(operation);
  }

  editPageQuill(pageId: string, quillId: string, operation: object) {
    const quill = this.getPageQuill(pageId, quillId);
    if (quill) quill.content.ops.push(operation);
  }

  splitPageLayoutPane(
    pageId: string,
    paneId: string,
    edge: IDirection,
    size: number
  ) {
    throw new Error("Not implemented");
  }

  resizePageLayoutPane(
    pageId: string,
    paneId: string,
    edge: IDirection,
    size: number
  ) {
    throw new Error("Not implemented");
  }
}
