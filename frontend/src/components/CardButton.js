import React from 'react'

export function CardButton({onClick, children}) {
    return (
        <button 
            className="h-48 w-96 text-4xl bg-blue-400 text-white border border-blue-400 rounded hover:bg-transparent hover:text-blue-400"
            onClick={onClick}>
            {children}
        </button>
    )
}
