import { v4 as uuidv4 } from "uuid";
import {
  ISource,
  IPage,
  INotebook,
  IReference,
  IQuill,
  IPaneProps,
  IPane,
  ILayout,
  IContent,
} from "./types";
import generateName from "project-name-generator";
import { Direction } from "../Layout/UseLayout/Rect";

export function makeSource({
  id,
  title,
  type,
  content,
  path,
  index,
}: Partial<ISource>): ISource {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = generateName().spaced;
  if (type === undefined) type = "unknown";
  if (content === undefined) content = "";
  if (path === undefined) path = undefined;
  if (index === undefined) index = undefined;

  return {
    id,
    title,
    type,
    content,
    path,
    index,
  };
}

export function makeReference({
  id,
  title,
  sourceId,
}: Partial<IReference>): IReference {
  if (id === undefined) id = uuidv4();
  if (title === undefined) title = generateName().spaced;
  if (sourceId === undefined) sourceId = "unknown";

  return {
    id,
    title,
    sourceId,
  };
}

export function makePaneProps({
  type,
  paramId,
}: Partial<IPaneProps>): IPaneProps {
  if (type === undefined) type = "default";
  if (paramId === undefined) paramId = undefined;

  return {
    type,
    paramId,
  };
}

export function makePane({
  id,
  position,
  size,
  previous,
  next,
  props,
}: Partial<IPane>): IPane {
  if (id === undefined) id = uuidv4();
  if (position === undefined) position = 0;
  if (size === undefined) size = 1;
  if (previous === undefined) previous = null;
  if (next === undefined) next = null;
  if (props === undefined) props = makePaneProps({});

  return {
    type: "pane",
    id,
    position,
    size,
    previous,
    next,
    props,
  };
}

export function makeLayout({
  id,
  position,
  size,
  orientation,
  previous,
  next,
  children,
}: Partial<ILayout>): ILayout {
  if (id === undefined) id = uuidv4();
  if (position === undefined) position = 0;
  if (size === undefined) size = 1;
  if (orientation === undefined) orientation = "horizontal";
  if (previous === undefined) previous = null;
  if (next === undefined) next = null;
  if (children === undefined) children = [makePane({})];

  return {
    type: "layout",
    id,
    position,
    size,
    orientation,
    previous,
    next,
    children,
  };
}

export function makeContent({ ops }: Partial<IContent>): IContent {
  if (ops === undefined) ops = [];

  return {
    ops,
  };
}

export function makeQuill({ id, content }: Partial<IQuill>): IQuill {
  if (id === undefined) id = uuidv4();
  if (content === undefined) content = makeContent({});

  return {
    id,
    content,
  };
}

export function makePage({
  id,
  references,
  layout,
  content,
  quills,
}: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (references === undefined) references = [];
  if (layout === undefined) layout = makeLayout({});
  if (content === undefined) content = makeContent({});
  if (quills === undefined) quills = [];

  return {
    id,
    references,
    layout,
    content,
    quills,
  };
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
      pages: this.pages,
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
    edge: Direction,
    size: number
  ) {
    throw new Error("Not implemented");
  }

  resizePageLayoutPane(
    pageId: string,
    paneId: string,
    edge: Direction,
    size: number
  ) {
    throw new Error("Not implemented");
  }
}
