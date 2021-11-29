import React from "react";
import { Subtract } from "utility-types";
import { v4 as uuidv4 } from "uuid";

import { getStrings } from "../strings";

export interface ISource {
  id: string;
  content: string;
}

export interface IReference {
  id: string;
  sourceId: string;
}

export type IContent = object;

export interface IPage {
  id: string;
  references: IReference[];
  layout: any;
  content: IContent;
}

export interface INotebook {
  id: string;
  name: string;
  sources: ISource[];
  pages: IPage[];
}

export function createNotebook({
  id,
  name,
  sources,
  pages,
}: Partial<INotebook>): INotebook {
  if (id === undefined) id = uuidv4();
  if (name === undefined) name = getStrings().newNotebookTitle;
  if (sources === undefined) sources = [];
  if (pages === undefined) pages = [createPage({})];

  return {
    id,
    name,
    sources,
    pages,
  };
}

export function createPage({
  id,
  references,
  layout,
  content,
}: Partial<IPage>): IPage {
  if (id === undefined) id = uuidv4();
  if (references === undefined) references = [];
  if (layout === undefined) layout = undefined;
  if (content === undefined) content = [];

  return {
    id,
    references,
    layout,
    content,
  };
}

export function makeNotebookUnique(notebook: INotebook): INotebook {
  return {
    ...notebook,
    id: uuidv4(),
    pages: notebook.pages.map(makePageUnique),
  };
}

export function makePageUnique(page: IPage): IPage {
  return {
    ...page,
    id: uuidv4(),
  };
}

export interface UseNotebookProps {
  forwardedRef: React.Ref<any>;
}

export interface UseNotebookState {}

export interface UseNotebookInjectedProps {}

type Props<P extends UseNotebookInjectedProps> = Subtract<
  P & UseNotebookProps,
  UseNotebookInjectedProps
>;

export interface NotebookManager {}

type PropsWithoutRef<P extends UseNotebookInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export function UseNotebook<P extends UseNotebookInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithNotebook
    extends React.Component<Props<P>>
    implements NotebookManager
  {
    getSources() {}

    getSource() {}

    getPage() {}

    getPageReferences() {}

    getPageReference() {}

    getPageLayout() {}

    getPageContent() {}

    addPage(page: IPage, callback?: () => void) {}

    insertPage(page: IPage, index: number, callback?: () => void) {}

    removePage(id: string, callback?: () => void) {}
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithNotebook {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
