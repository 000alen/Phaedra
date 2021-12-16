import { IContent, ILayout, IPage, IPane, IPaneProps, IQuill, IReference, ISource } from "./Notebook";
export declare function makeSource({ id, title, type, content, path, index }: Partial<ISource>): ISource;
export declare function makeReference({ id, title, sourceId }: Partial<IReference>): IReference;
export declare function makePaneProps({ type, paramId }: Partial<IPaneProps>): IPaneProps;
export declare function makePane({ id, position, size, previous, next, props }: Partial<IPane>): IPane;
export declare function makeLayout({ id, position, size, orientation, previous, next, children }: Partial<ILayout>): ILayout;
export declare function makeContent({ ops }: Partial<IContent>): IContent;
export declare function makeQuill({ id, content }: Partial<IQuill>): IQuill;
export declare function makePage({ id, references, layout, content, quills }: Partial<IPage>): IPage;
