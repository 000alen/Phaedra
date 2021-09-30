import React from 'react';
import {CommandBar} from '@fluentui/react';

function ViewItems({ notebookRef, commandBoxRef, appController, pageController }) {
    const viewItems = [];

    return (
        <CommandBar items={viewItems} />                
    )
}

export default ViewItems;
