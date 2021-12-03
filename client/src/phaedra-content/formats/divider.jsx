import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");

export class Divider extends BlockEmbed {
  static blotName = "divider";
  static tagName = "hr";
}
