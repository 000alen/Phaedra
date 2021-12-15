declare const Poll_base: any;
export class Poll extends Poll_base {
    [x: string]: any;
    static blotName: string;
    static tagName: string;
    static className: string;
    static ref: {};
    static create(value: any): any;
    static value(domNode: any): any;
    constructor(domNode: any);
    id: any;
    data: any;
    attach(): void;
    renderPortal(id: any): React.ReactPortal;
    detach(): void;
}
import React from "react";
export {};
