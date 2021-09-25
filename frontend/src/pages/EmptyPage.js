import React, {useState} from 'react';
import { getApiUrl } from '../API';
import NavigationBar from '../components/NavigationBar';
import SideBar from '../components/SideBar';

export function EmptyPage() {
    const [apiUrl, setApiUrl] = useState(getApiUrl());

    const handleUrl = (event) => {
        setApiUrl(event.target.value);
        window.localStorage.setItem('apiUrl', event.target.value);
    };

    return (
        <div className="page emptyPage">
            <NavigationBar />

            <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
            }}>
                <SideBar />

                <div>
                    <div className="flex flex-row">
                        <button className="p-2 bg-indigo-600 rounded text-white font-semibold">Open</button>
                        <button className="p-2 bg-indigo-600 rounded text-white font-semibold">New</button>
                    </div>
        
                    <h1 className="text-7xl">Welcome to Phaedra!</h1>
                    <div className="flex flex-row space-x-2">
                        <h2>API_URL:</h2>
                        <input type="text" value={apiUrl} placeholder="url" onChange={handleUrl} />
                    </div>
                </div>
            </div>
        </div>
    )
}
