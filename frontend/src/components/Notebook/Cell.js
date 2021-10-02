import React from 'react';
import ReactMarkdown from 'react-markdown';
import { theme } from '../../index';
import { v4 as uuidv4 } from 'uuid';
import { PrimaryButton, Shimmer, TextField, mergeStyles } from '@fluentui/react';

export function createCell(id, data, content) {
    if (!id) id = uuidv4();
    if (!data) data = {};
    if (!content) content = '';

    return {
        id: id,
        data: data,
        content: content
    }
}

function Cell({ id, pageController, notebookController, data, content, pageId, active, editing }) {
    const [contentText, setContentText] = React.useState(content);

    const handleSelection = (event) => {
        if (active && editing) return;
        notebookController.handleSelection(pageId, id);
        event.stopPropagation();
    };

    const handleChange = (event) => {
        setContentText(event.target.value);
    }

    const handleSet = () => {
        notebookController.setCellContent(pageId, id, contentText, true);
    }

    const style = { 
        backgroundColor: theme.palette.neutralLight,
        border: `1px solid ${theme.palette.neutralLight}`
    }
    const activeStyle = {
        backgroundColor: theme.palette.neutralLight,
        border: `1px solid ${theme.palette.themePrimary}`
    }

    const wrapperClass = mergeStyles({
        selectors: {
          '& > .ms-Shimmer-container': {
            margin: '10px 0',
          },
        },
    });

    return (
        (active && editing) ? <div className="cell m-2 space-y-2">
            <TextField 
                value={contentText} 
                onChange={handleChange}
                multiline 
                autoAdjustHeight />
            <PrimaryButton 
                text="Set"
                onClick={handleSet} /> 
        </div> : <div 
            className={`cell p-2 m-2 rounded-sm shadow-md text-justify ${wrapperClass}`} 
            style={active ? activeStyle : style} 
            onClick={handleSelection}>
                <ReactMarkdown
                    children={content}
                    linkTarget="_blank" />
        </div>
    );
}

export default Cell;
