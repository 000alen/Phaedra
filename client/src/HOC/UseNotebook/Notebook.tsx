import { LayoutJSON } from "../../phaedra-layout/UseLayout/UseLayout"; // ! TODO

export interface ISource {
  id: string;
  content: string;
}

export interface IReference {
  id: string;
  sourceId: string;
}

export type IContent = string; // ! TODO

export type ILayout = LayoutJSON;

export interface PageJSON {
  id: string;
  references: IReference[];
  layout: ILayout;
  content: IContent;
}

export class Page {
  constructor(
    public id: string,
    public references: IReference[],
    public layout: ILayout,
    public content: IContent
  ) {}

  getReference(id: string) {}

  addReference(reference: IReference) {}

  removeReference(id: string) {}

  JSON(): PageJSON {
    return {
      id: this.id,
      references: this.references,
      layout: this.layout,
      content: this.content,
    };
  }
}

export interface NotebookJSON {
  id: string;
  name: string;
  sources: ISource[];
  pages: PageJSON[];
}

export class Notebook {
  constructor(
    public id: string,
    public name: string,
    public sources: ISource[],
    public pages: Page[]
  ) {}

  getSource(id: string) {}

  addSource(source: ISource) {}

  removeSource(id: string) {}

  getPage(id: string) {}

  addPage(page: Page) {}

  removePage(id: string) {}

  JSON(): NotebookJSON {
    return {
      id: this.id,
      name: this.name,
      sources: this.sources,
      pages: this.pages.map((page) => page.JSON()),
    };
  }
}
