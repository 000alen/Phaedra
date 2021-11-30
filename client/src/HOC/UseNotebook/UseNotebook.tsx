import React from "react";
import { Subtract } from "utility-types";
import { NotebookJSON, PageJSON } from "./Notebook";

export interface UseNotebookProps {
  forwardedRef: React.Ref<any>;
  defaultNotebook?: NotebookJSON;
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
    constructor(props: Props<P>) {
      super(props);

      const { defaultNotebook } = props;

      this.state = {
        notebook:
          defaultNotebook !== undefined ? defaultNotebook : this.empty(),
      };
    }

    pageFromJSON() {}

    notebookFromJSON() {}

    empty() {}

    getSources() {}

    getSource() {}

    getPage() {}

    getPageReferences() {}

    getPageReference() {}

    getPageLayout() {}

    getPageContent() {}

    addPage(page: PageJSON, callback?: () => void) {}

    insertPage(page: PageJSON, index: number, callback?: () => void) {}

    removePage(id: string, callback?: () => void) {}
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithNotebook {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
