import React from "react";
import {
  DocumentCard,
  DocumentCardDetails,
  DocumentCardPreview,
  DocumentCardTitle,
  DocumentCardType,
  IDocumentCardPreviewProps
} from "@fluentui/react";
import { getTheme } from "../themes";

interface CardFileProps {
  name: string;
  onClick?: () => void;
}

const theme = getTheme();
const { palette, fonts } = theme;

const previewPropsUsingIcon: IDocumentCardPreviewProps = {
  previewImages: [
    {
      previewIconProps: {
        iconName: "OpenFile",
        styles: {
          root: { fontSize: fonts.superLarge.fontSize, color: palette.white }
        }
      },
      width: 100
    }
  ],
  styles: { previewIcon: { backgroundColor: palette.themePrimary } }
};

export function CardFile({ name, onClick }: CardFileProps) {
  return (
    <DocumentCard type={DocumentCardType.compact} onClick={onClick}>
      <DocumentCardPreview {...previewPropsUsingIcon} />
      <DocumentCardDetails>
        <DocumentCardTitle title={name} />
      </DocumentCardDetails>
    </DocumentCard>
  );
}
