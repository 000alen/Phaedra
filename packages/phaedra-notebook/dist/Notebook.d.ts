export declare type IDirection = "north" | "south" | "east" | "west";
export declare type IOrientation = "horizontal" | "vertical";
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
    splitPageLayoutPane: (pageId: string, paneId: string, edge: IDirection, relativeSize: number) => void;
    resizePageLayoutPane: (pageId: string, paneId: string, edge: IDirection, size: number) => void;
    removePageLayoutPane: (pageId: string, paneId: string) => void;
}
export declare class Notebook {
    id: string;
    name: string;
    sources: ISource[];
    pages: IPage[];
    constructor({ id, name, sources, pages }: Partial<INotebook>);
    JSON(): {
        id: string;
        name: string;
        sources: ISource[];
        pages: IPage[];
    };
    getId(): string;
    getName(): string;
    getSources(): ISource[];
    getPages(): IPage[];
    getSource(sourceId: string): ISource | undefined;
    getPage(pageId: string): IPage | undefined;
    getPageReferences(pageId: string): IReference[] | undefined;
    getPageLayout(pageId: string): ILayout | undefined;
    getPageLayoutPanes(pageId: string): void;
    getPageContent(pageId: string): IContent | undefined;
    getPageQuills(pageId: string): IQuill[] | undefined;
    getPageReference(pageId: string, referenceId: string): IReference | undefined;
    getPageLayoutPane(pageId: string, paneId: string): void;
    getPageQuill(pageId: string, quillId: string): IQuill | undefined;
    addSource(source: ISource): void;
    addPage(page: IPage): void;
    addPageReference(pageId: string, reference: IReference): void;
    addPageQuill(pageId: string, quill: IQuill): void;
    removeSource(sourceId: string): void;
    removePage(pageId: string): void;
    removePageReference(pageId: string, referenceId: string): void;
    removePageLayoutPane(pageId: string, paneId: string): void;
    removePageQuill(pageId: string, quillId: string): void;
    rename(name: string): void;
    editPageContent(pageId: string, operation: object): void;
    editPageQuill(pageId: string, quillId: string, operation: object): void;
    splitPageLayoutPane(pageId: string, paneId: string, edge: IDirection, size: number): void;
    resizePageLayoutPane(pageId: string, paneId: string, edge: IDirection, size: number): void;
}
