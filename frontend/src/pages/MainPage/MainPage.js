import React, { useState } from 'react'
import { Nav } from '@fluentui/react';
import BackendView from './views/BackendView';
import FromPdfView from './views/FromPdfView';
import FromTextView from './views/FromTextView';
import NotebookView from './views/NotebookView';
import PinnedView from './views/PinnedView';
import RecentView from './views/RecentView';
import EmptyView from './views/EmptyView';

import '../../css/MainPage.css';

const navLinkGroups = [
    {
        name: 'Home',
        links: [
            { name: 'Recent', key: 'recent' },
            { name: 'Pinned', key: 'pinned' },
        ],
    },
    {
        name: 'New',
        links: [
            { name: 'Empty', key: 'empty' },
            { name: 'From PDF', key: 'from_pdf' },
            { name: 'From text', key: 'from_text' },
        ],
    },
    {
        name: 'Open',
        links: [
            { name: 'Notebook', key: 'notebook' },
        ]
    },
    {
        name: 'Settings',
        links: [
            { name: 'Connect to a backend', key: 'backend' },
        ]
    }
];

function MainPage({ id, appController }) {
    const [selectedKey, setSelectedKey] = useState('backend');

    const navLinkContents = {
        'recent': <RecentView id={id} appController={appController} />,
        'pinned': <PinnedView id={id} appController={appController} />,
        'empty': <EmptyView id={id} appController={appController} />,
        'from_pdf': <FromPdfView id={id} appController={appController} />,
        'from_text': <FromTextView id={id} appController={appController} />,
        'notebook': <NotebookView id={id} appController={appController} />,
        'backend': <BackendView id={id} appController={appController} />,
    };

    return (
        <div className="mainPage">
            <div className="sideBar">
                <Nav
                    ariaLabel="Nav example with custom group headers"
                    groups={navLinkGroups}
                    onLinkClick={(e, item) => setSelectedKey(item.key)}
                    selectedKey={selectedKey}
                />
            </div>

            <div className="pageContent">
                {navLinkContents[selectedKey]}
            </div>
        </div>
    )
}

export default MainPage;
