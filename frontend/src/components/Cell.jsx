import React from 'react';
import ReactMarkdown from 'react-markdown';

import "../css/Cell.css";
import "../css/Fonts.css";


export function Cell({ content, font }) {

    return (
            <div className="cell">
                <ReactMarkdown className="cellMarkdown" linkTarget="_blank" style={{ fontFamily: font }}>
                    {content}
                </ReactMarkdown>
            </div>    
        );
}
