"use client";
import { useState } from 'react';

const AddUser = ({ onUserAdded }) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name) {
            setMessage("Please enter a name.");
            return;
        }

        try {
            const response = await fetch('/api/addUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setName('');
                if (onUserAdded) {
                    onUserAdded(name); // Callback to parent component
                }
            } else {
                setMessage(data.message || "An error occurred");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 rounded-lg">
            <form onSubmit={handleSubmit} className="flex items-center">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter user name"
                />
                <button
                    type="submit"
                    className="ml-2 bg-blue-600 text-white font-semibold py-1 px-2 rounded-md hover:bg-blue-700 transition duration-150"
                >
                    +
                </button>
            </form>
            {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
        </div>
    );
};

export default AddUser;
