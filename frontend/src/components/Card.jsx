import React from 'react';
import { FileUploader } from "react-drag-drop-files";

import "../css/Card.css";

export function Card({ fileTypes, handleFile }) {
    return (
        <div className="cardContainer">
            <div className="cardChildrenContainer">
                <FileUploader
                    name="file"
                    types={fileTypes}
                    onDrop={handleFile}
                    classes="cardFileUploader"
                >
                    <div className="cardFileUploaderInner">+</div>
                </FileUploader>
            </div>
        </div>

    )
}
