import React from "react";

import {
  DocumentCard,
  DocumentCardImage,
  DocumentCardTitle,
  IIconProps,
} from "@fluentui/react";
import { mergeStyles } from "@fluentui/react/lib/Styling";

export interface CardProps {
  iconProps: IIconProps;
  title: string;
  subtitle: string;
  onClick: (
    event: React.SyntheticEvent<HTMLElement, Event> | undefined
  ) => void;
}

const cardInnerClasses = mergeStyles({
  height: "auto",
  paddingBottom: "10px",
});

const cardStyles = {
  root: { display: "inline-block", marginRight: 20, width: 320 },
};

export function Card({ iconProps, title, subtitle, onClick }: CardProps) {
  return (
    <div>
      <DocumentCard styles={cardStyles} onClick={onClick}>
        <DocumentCardImage height={150} iconProps={iconProps} />
        <div className={cardInnerClasses}>
          <DocumentCardTitle title={title} shouldTruncate />
          <DocumentCardTitle
            title={subtitle}
            shouldTruncate
            showAsSecondaryTitle
          />
        </div>
      </DocumentCard>
    </div>
  );
}
