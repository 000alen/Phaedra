import React from "react";
import { Subtract } from "utility-types";
import { IPage } from "../../Notebook/types";
import { NotebookManager } from "../../Notebook/UseNotebook";

export type Delta = object;

export interface UseContentProps {
  forwardedRef: React.Ref<any>;
  defaultContent?: Delta | undefined;
  onContentChange?: (content: Delta) => void;
  modules?: object;
  formats?: object;
  autoformat?: object;
  readOnly?: boolean;
  spellCheck?: boolean;

  id: string;
  notebookManager: NotebookManager;
  page: IPage;
}

export interface UseContentState {
  defaultContent: Delta;
}

export interface UseContentInjectedProps {
  _contentManager: ContentManager;
  _defaultContent: Delta;
  _onContentChange: (content: Delta) => void;
  _modules: object;
  _formats: object;
  _autoformat: object;
  _readOnly: boolean;
  _spellCheck: boolean;
  _id: string;
  _notebookManager: NotebookManager;
  _page: IPage;
}

export interface ContentManager {}

type Props<P extends UseContentInjectedProps> = Subtract<
  P & UseContentProps,
  UseContentInjectedProps
>;

type PropsWithoutRef<P extends UseContentInjectedProps> = Subtract<
  Props<P>,
  { forwardedRef: React.Ref<any> }
>;

export function empty(): Delta {
  return {
    ops: [],
  };
}

export function UseContent<P extends UseContentInjectedProps>(
  Component: React.ComponentType<P>
) {
  class WithContent
    extends React.Component<Props<P>, UseContentState>
    implements ContentManager
  {
    constructor(props: Props<P>) {
      super(props);

      this.onContentChange = this.onContentChange.bind(this);

      const { defaultContent } = this.props;

      const _defaultContent: Delta =
        defaultContent !== undefined ? (defaultContent as Delta) : empty();

      this.state = {
        defaultContent: _defaultContent,
      };
    }

    onContentChange(content: Delta) {
      const { onContentChange } = this.props;
      if (onContentChange !== undefined) onContentChange(content);
    }

    render() {
      const {
        forwardedRef,
        modules,
        formats,
        autoformat,
        readOnly,
        spellCheck,
        id,
        notebookManager,
        page,
        ...rest
      } = this.props;
      const { defaultContent } = this.state;

      return (
        <Component
          {...(rest as P)}
          ref={forwardedRef}
          _contentManager={this}
          _defaultContent={defaultContent}
          _onContentChange={this.onContentChange}
          _modules={modules !== undefined ? modules : {}}
          _formats={formats !== undefined ? formats : []}
          _autoformat={autoformat !== undefined ? autoformat : {}}
          _readOnly={readOnly !== undefined ? readOnly : false}
          _spellCheck={spellCheck !== undefined ? spellCheck : false}
          _id={id}
          _notebookManager={notebookManager}
          _page={page}
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithContent {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
