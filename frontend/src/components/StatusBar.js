import React from 'react';
import '../css/StatusBar.css';
import {Spinner, SpinnerSize, Text} from '@fluentui/react';

function StatusBar() {
    return (
        <div className="statusBar flex items-center ml-2 space-x-2">
            <Spinner 
                size={SpinnerSize.xSmall} />
            <Text variant="small">Loading</Text> 
        </div>
    )
}

export default StatusBar;