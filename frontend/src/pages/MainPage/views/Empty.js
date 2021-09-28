import React from 'react';
import Card from '../../../components/Card';

const newIcon = {
    iconName: 'FileTemplate',
};

export default function Empty() {
    const handleNew = () => {};
    
    return (
        <div className="flex items-center justify-center">
            <div className="flex flex-row space-x-1">
                <Card
                    iconProps={newIcon}
                    title="Create Notebook"
                    subtitle="Create a JSON Notebook"
                    onClick={handleNew} />
            </div>
        </div>
    )
}
