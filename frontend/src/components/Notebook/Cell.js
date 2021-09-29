import React from 'react';
import ReactMarkdown from 'react-markdown';
import { theme } from '../../index';
import { v4 as uuidv4 } from 'uuid';

export function createCell() {
    return {
        id: uuidv4(),
        data: {},
        content: 'Hello, world!'
    }
}


function Cell({ id, notebookController, data, content, pageId, active }) {
    const handleSelect = () => {
        notebookController.toggleSelectCell(pageId, id);
    };

    const style = {backgroundColor: theme.palette.neutralLight}
    const activeStyle = {backgroundColor: theme.palette.themePrimary, color: theme.palette.white }

    return (
        <div className="cell p-2 m-2 rounded-sm shadow-md text-justify" style={active ? activeStyle : style} onClick={handleSelect}>
            <ReactMarkdown 
                children={content}
                linkTarget="_blank" />
        </div>
    );
}

export default Cell;
