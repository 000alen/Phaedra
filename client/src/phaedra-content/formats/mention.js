import Quill from "quill";

const Embed = Quill.import("blots/embed");

export class Mention extends Embed {
  static create(value) {
    const node = super.create(value);
    node.setAttribute("title", value);
    node.setAttribute("href", this.BASE_URL + value);
    node.textContent = "@" + value;
    return node;
  }

  static value(domNode) {
    return domNode.textContent;
  }
}
Mention.blotName = "mention";
Mention.className = "ql-mention";
Mention.tagName = "A";
Mention.BASE_URL = "/";
