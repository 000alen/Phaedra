import React from "react";
export declare type Delta = object;
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
export interface ContentManager {
}
export declare function UseContent<P extends UseContentInjectedProps>(Component: React.ComponentType<P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<Pick<Pick<P & UseContentProps, "forwardedRef" | "defaultContent" | "onContentChange" | "modules" | "formats" | "autoformat" | "readOnly" | "spellCheck" | import("utility-types").SetDifference<keyof P, "_contentManager" | "_defaultContent" | "_onContentChange" | "_modules" | "_formats" | "_autoformat" | "_readOnly" | "_spellCheck">>, "defaultContent" | "onContentChange" | "modules" | "formats" | "autoformat" | "readOnly" | "spellCheck" | import("utility-types").SetDifference<import("utility-types").SetDifference<keyof P, "_contentManager" | "_defaultContent" | "_onContentChange" | "_modules" | "_formats" | "_autoformat" | "_readOnly" | "_spellCheck">, "forwardedRef">>> & React.RefAttributes<unknown>>;
