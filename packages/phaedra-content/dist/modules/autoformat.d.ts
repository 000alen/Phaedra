export class Autoformat {
    constructor(quill: any, options: any);
    quill: any;
    options: any;
    transforms: any;
    registerPasteListener(): void;
    registerTypeListener(): void;
    forwardKeyboard(range: any, context: any): void;
    forwardKeyboardUp(range: any, context: any): void;
    forwardKeyboardDown(range: any, context: any): void;
    openHelper(transform: any, index: any): void;
    currentHelper: any;
    closeHelper(transform: any): void;
}
