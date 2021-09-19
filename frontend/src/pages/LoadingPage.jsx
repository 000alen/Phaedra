import React, { Fragment } from 'react';

import "../css/LoadingPage.css";

export function LoadingPage({ show }) {
    if (show) {
        return (
            <Fragment>
                <div className="loading-background"/>
                <div className="loader">
                    <span/>
                    <span/>
                    <span/>
                    <span/>
                </div>
            </Fragment>
        );
    } else {
        return <div/>;
    }
}
