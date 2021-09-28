import React from 'react';
import { initializeIcons, DocumentCard, DocumentCardTitle, DocumentCardImage } from '@fluentui/react';
import { mergeStyles } from '@fluentui/react/lib/Styling';

initializeIcons();

function Card({iconProps, title, subtitle, onClick}) {
    const conversationTileClass = mergeStyles({ height: "auto", paddingBottom: "10px" });

    const cardStyles = {
        root: { display: 'inline-block', marginRight: 20, width: 320 },
    };

    return (
        <div>
            <DocumentCard styles={cardStyles} onClick={onClick}>
                <DocumentCardImage height={150} iconProps={iconProps} />
                <div className={conversationTileClass}>
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

export default Card;
