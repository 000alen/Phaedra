import React, {useState} from 'react';
import { getApiUrl } from '../API';

export function EmptyPage() {
    const [apiUrl, setApiUrl] = useState(getApiUrl());

    const handleUrl = (event) => {
        setApiUrl(event.target.value);
        window.localStorage.setItem('apiUrl', event.target.value);
    };

    return (
        <div className="page emptyPage m-2 font-mono space-y-2">
            <h1 className="text-7xl">Welcome to Phaedra!</h1>
            
            <div className="flex flex-row space-x-2">
                <h2>API_URL:</h2>
                <input type="text" value={apiUrl} placeholder="url" onChange={handleUrl} />
            </div>
        </div>
    )
}
