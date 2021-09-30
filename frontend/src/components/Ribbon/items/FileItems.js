import React from 'react';
import {CommandBar} from '@fluentui/react';

function FileItems({ notebookRef, commandBoxRef, appController, pageController }) {
    const fileItems = [];

    return (
        <CommandBar items={fileItems} />                
    )
}

export default FileItems;
