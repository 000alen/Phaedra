import React from 'react';
import {CommandBar} from '@fluentui/react';

function ViewItems({ notebookRef, commandBoxRef, appController, pageController }) {
    const viewItems = [
        {
            key: 'reading',
            name: 'Reading view',
            iconProps: { iconName: 'ReadingMode' },
        }
    ];

    return (
        <CommandBar items={viewItems} />                
    )
}

export default ViewItems;
