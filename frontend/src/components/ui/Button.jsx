import React from "react";


export default function Button({children, onClick, type}) {
    return (
        <button onClick={onClick} type={type} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {children}
        </button>
    )
}