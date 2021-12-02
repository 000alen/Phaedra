export enum Direction {
  North,
  South,
  East,
  West,
}

export enum Orientation {
  Horizontal,
  Vertical,
}

export class Rect {
  public id: string;
  public position: number;
  public size: number;
  public orientation: Orientation;
  public parent: any;
  public previous: any;
  public next: any;

  constructor(
    id: string,
    position: number,
    size: number,
    orientation: Orientation,
    parent: any = null,
    previous: any = null,
    next: any = null
  ) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.orientation = orientation;
    this.parent = parent;
    this.previous = previous;
    this.next = next;
  }

  get left(): number {
    return this.computePosition(Orientation.Horizontal);
  }

  get top(): number {
    return this.computePosition(Orientation.Vertical);
  }

  get width(): number {
    return this.computeSize(Orientation.Horizontal);
  }

  get height(): number {
    return this.computeSize(Orientation.Vertical);
  }

  computePosition(orientation: Orientation): number {
    let pos = 0;

    let node: any = this;
    while (node.parent) {
      if (node.parent.orientation === orientation)
        pos = node.position + node.size * pos;
      node = node.parent;
    }

    return pos;
  }

  computeSize(orientation: Orientation): number {
    let size = 1;

    let node: any = this;
    while (node.parent) {
      if (node.parent.orientation === orientation) size *= node.size;
      node = node.parent;
    }

    return size;
  }

  setRange(a: number, b: number) {
    this.position = a;
    this.size = b - a;
  }

  bounds(domRect: DOMRect) {
    const { width, height, left, top } = domRect;

    return {
      left: left + width * this.left,
      top: top + height * this.top,
      width: width * this.width,
      height: height * this.height,
    };
  }
}

export class PaneRect extends Rect {
  public props: object;

  constructor(
    id: string,
    position: number,
    size: number,
    orientation: Orientation,
    parent: any = null,
    previous: any = null,
    next: any = null,
    props: object = {}
  ) {
    super(id, position, size, orientation, parent, previous, next);
    this.props = props;
  }

  destroy(panes: PaneRect[], dividers: DividerRect[]) {
    const index = panes.indexOf(this);
    if (index === -1) throw new Error("Unexpected error");
    panes.splice(index, 1);
  }
}

export class DividerRect extends Rect {
  public dragging: boolean;
  public closing: boolean;

  constructor(
    id: string,
    position: number,
    size: number,
    orientation: Orientation,
    parent: any = null,
    previous: any = null,
    next: any = null,
    dragging: boolean = false,
    closing: boolean = false
  ) {
    super(id, position, size, orientation, parent, previous, next);
    this.dragging = dragging;
    this.closing = closing;
  }

  destroy(dividers: DividerRect[]) {
    const index = dividers.indexOf(this);
    if (index === -1) throw new Error("Unexpected error");
    dividers.splice(index, 1);
  }
}

export class LayoutRect extends Rect {
  public children: any[];
  public dividers: any[];

  constructor(
    id: string,
    position: number,
    size: number,
    orientation: Orientation,
    parent: any = null,
    previous: any = null,
    next: any = null,
    children: any[] = [],
    dividers: any[] = []
  ) {
    super(id, position, size, orientation, parent, previous, next);
    this.children = children;
    this.dividers = dividers;
  }

  getAllPanes() {
    return this.children.reduce((panes, child) => {
      if (child instanceof PaneRect) panes.push(child);
      else panes.push(...child.getAllPanes());
      return panes;
    }, []);
  }

  getAllDividers() {
    return this.children.reduce(
      (dividers, child) => {
        if (child instanceof LayoutRect)
          dividers.push(...child.getAllDividers());
        return dividers;
      },
      [...this.dividers]
    );
  }

  destroy(panes: PaneRect[], dividers: DividerRect[]) {
    let i = this.children.length;
    while (i--) this.children[i].destroy(panes, dividers);

    i = this.dividers.length;
    while (i--) this.dividers[i].destroy(dividers);
  }

  addChild(child: PaneRect | LayoutRect) {
    this.children.push(child);
    child.parent = this;
  }

  replaceChild(child: PaneRect | LayoutRect, replacement: LayoutRect) {
    const index = this.children.indexOf(child);
    if (index === -1) throw new Error("Unexpected error");
    this.children[index] = replacement;

    replacement.parent = this;

    child.parent = replacement;
    replacement.children.push(child);
  }

  addDivider(divider: DividerRect) {
    this.dividers.push(divider);
    divider.parent = this;
  }
}
