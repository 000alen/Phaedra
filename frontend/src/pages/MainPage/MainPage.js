import React, {useState} from 'react'
import { Nav } from '@fluentui/react';
import Backend from './views/Backend';
import Empty from './views/Empty';
import FromPdf from './views/FromPdf';
import FromText from './views/FromText';
import Notebook from './views/Notebook';
import Pinned from './views/Pinned';
import Recent from './views/Recent';

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

function MainPage({id, appController}) {
    const [selectedKey, setSelectedKey] = useState('backend');

    const navLinkContents = {
        'recent': <Recent id={id} appController={appController} />,
        'pinned': <Pinned id={id} appController={appController} />,
        'empty': <Empty id={id} appController={appController} />,
        'from_pdf': <FromPdf id={id} appController={appController} />,
        'from_text': <FromText id={id} appController={appController} />,
        'notebook': <Notebook id={id} appController={appController} />,
        'backend': <Backend id={id} appController={appController} />,
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
