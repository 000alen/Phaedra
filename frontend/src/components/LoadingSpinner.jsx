import React from 'react';

import "../css/LoadingSpinner.css";

export function LoadingSpinner({ circle_size, line_width }) {
    return <div className="spinner-loader"
        style={{
            width: circle_size,
            height: circle_size,
            fontSize: line_width
        }}>Loading...</div>
}
