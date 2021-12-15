export function register(toRegister: any): void;
export class Editor extends React.Component<any, any, any> {
    constructor(props: any);
    onMount(...blots: any[]): void;
    onUnmount(unmountedBlot: any): void;
    onContentChange(delta: any, oldDelta: any, source: any): void;
    editor: Quill | null;
    editorContainer: React.RefObject<any>;
}
import React from "react";
import Quill from "quill";
