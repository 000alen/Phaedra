import React from 'react';
import { DetailsList } from '@fluentui/react';

const items = [
    { key: 'a', name: 'A', value: 'value a' },
    { key: 'b', name: 'B', value: 'value b' },
    { key: 'c', name: 'C', value: 'value c' },
];

const columns = [
    { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'value', name: 'Value', fieldName: 'value', minWidth: 100, maxWidth: 200, isResizable: true },
];

export default function PinnedView() {
    return (
        <div>
            <DetailsList
                items={items}
                columns={columns} />
        </div>
    )
}
