import React from "react";
import { Subtract } from "utility-types";

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
      this.empty = this.empty.bind(this);

      const { defaultContent } = this.props;

      const _defaultContent: Delta =
        defaultContent !== undefined ? (defaultContent as Delta) : this.empty();

      this.state = {
        defaultContent: _defaultContent
      };
    }

    onContentChange(content: Delta) {
      const { onContentChange } = this.props;
      if (onContentChange !== undefined) onContentChange(content);
    }

    empty(): Delta {
      return {
        ops: []
      };
    }

    render() {
      const {
        forwardedRef,
        modules,
        formats,
        autoformat,
        readOnly,
        spellCheck,
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
        />
      );
    }
  }

  return React.forwardRef<unknown, PropsWithoutRef<P>>((props, ref) => (
    <WithContent {...(props as Props<P>)} forwardedRef={ref} />
  ));
}
