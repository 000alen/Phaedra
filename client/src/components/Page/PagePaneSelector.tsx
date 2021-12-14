import { IconButton, Label, OverflowSet, Separator } from "@fluentui/react";
import React from "react";
import { IPage } from "../../Notebook/types";
import { NotebookManager } from "../../Notebook/UseNotebook";
import { PaneRectProps } from "../../Layout/UseLayout/Rect";
import { CardFile } from "../CardFile";

export interface PagePaneSelectorProps {
  id: string;
  page: IPage;
  notebookManager: NotebookManager;
  addReference: (
    sourceId: string,
    callback?: (referenceId: string) => void
  ) => void;
  addQuill: (callback?: (quillId: string) => void) => void;
  setPaneProps: (props: PaneRectProps) => void;
}

export class PagePaneSelector extends React.Component<PagePaneSelectorProps> {
  addReference(sourceId: string) {
    const { setPaneProps, addReference } = this.props;
    addReference(sourceId, (referenceId) => {
      setPaneProps({ type: "reference", paramId: referenceId });
    });
  }

  openReference(referenceId: string) {
    const { setPaneProps } = this.props;
    setPaneProps({ type: "reference", paramId: referenceId });
  }

  addQuill() {
    const { setPaneProps, addQuill } = this.props;
    addQuill((_quillId) => {
      setPaneProps({ type: "quill", paramId: _quillId });
    });
  }

  openQuill(quillId: string) {
    const { setPaneProps } = this.props;
    setPaneProps({ type: "quill", paramId: quillId });
  }

  openContent() {
    const { setPaneProps } = this.props;
    setPaneProps({ type: "default" });
  }

  openVoid() {
    const { setPaneProps } = this.props;
    setPaneProps({ type: "void" });
  }

  onRenderItem(item: any) {
    return <CardFile name={item.name} onClick={item.onClick} />;
  }

  onRenderOverflowButton(items: any[] | undefined) {
    return (
      <IconButton
        menuIconProps={{ iconName: "More" }}
        menuProps={{ items: items! }}
      />
    );
  }

  render() {
    const { page, notebookManager } = this.props;

    const referenceItems = page.references.slice(0, 3).map((reference) => ({
      key: reference.id,
      name: reference.title,
      onClick: () => this.openReference(reference.id),
    }));

    const referenceOverflowItems = page.references
      .slice(3)
      .map((reference) => ({
        key: reference.id,
        name: reference.title,
        onClick: () => this.openReference(reference.id),
      }));

    const referenceAddMenuProps = notebookManager
      .getSources()
      .map((source) => ({
        key: source.id,
        name: source.title,
        onClick: () => this.addReference(source.id),
      }));

    const quillItems = page.quills.slice(0, 3).map((quill) => ({
      key: quill.id,
      name: quill.id,
      onClick: () => this.openQuill(quill.id),
    }));

    const quillOverflowItems = page.quills.slice(3).map((quill) => ({
      key: quill.id,
      name: quill.id,
      onClick: () => this.openQuill(quill.id),
    }));

    return (
      <div className="w-full h-full overflow-auto">
        <Label>Content</Label>
        <IconButton
          iconProps={{ iconName: "Add" }}
          onClick={() => this.openContent()}
        />
        <Separator />

        <Label>Void</Label>
        <IconButton
          iconProps={{ iconName: "Add" }}
          onClick={() => this.openVoid()}
        />
        <Separator />

        <Label>Reference</Label>
        <OverflowSet
          vertical
          items={referenceItems}
          overflowItems={referenceOverflowItems}
          onRenderItem={this.onRenderItem}
          onRenderOverflowButton={this.onRenderOverflowButton}
        />
        <IconButton
          iconProps={{ iconName: "Add" }}
          menuProps={{ items: referenceAddMenuProps }}
        />
        <Separator />

        <Label>Quill</Label>
        <OverflowSet
          vertical
          items={quillItems}
          overflowItems={quillOverflowItems}
          onRenderItem={this.onRenderItem}
          onRenderOverflowButton={this.onRenderOverflowButton}
        />
        <IconButton
          iconProps={{ iconName: "Add" }}
          onClick={() => this.addQuill()}
        />
        <Separator />
      </div>
    );
  }
}
