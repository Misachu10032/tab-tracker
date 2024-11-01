"use client";
import { useEffect, useState } from 'react';
import AddUser from "../components/AddUser"; // Ensure the import path is correct

export default function GameTable() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lender, setLender] = useState(null);
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState('');
  const [borrower, setBorrower] = useState(null); // State for the borrower

  // Function to handle when a user is added
  const handleUserAdded = (name) => {
    console.log(`User added: ${name}`);
    setUsers((prevUsers) => [...prevUsers, name]);
  };

  // Fetch users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/getUsers');
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    // Existing handleSelectUser logic
    if (action === 'selectingBorrower') {
      if (selectedUser === user) {
        // If the user is already the borrower, deselect them
        setBorrower(null);
        setSelectedUser(null);
        setAction(null);
      } else {
        // Otherwise, set the selected user as the borrower
        setBorrower(user);
      }
    } else {
      if (selectedUser === user) {
        // If the user is already selected, deselect them
        setSelectedUser(null);
      } else {
        // Otherwise, set the selected user
        setSelectedUser(user);
      }
    }
  };

  const handleAction = async (actionType) => {
    if (actionType === 'borrow') {
      // Call the borrow from bank API
      try {
        const response = await fetch('/api/borrowFromBank', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: selectedUser }),
        });
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error('Error borrowing from bank:', error);
        setMessage('Error borrowing from bank.');
      }
    } else if (actionType === 'lend') {
      // Set the selected user as the lender and change action to select borrower
      setLender(selectedUser);
      setAction('selectingBorrower');
    }
  };

  const handleLendTo = async () => {
    if (!lender || !borrower) return; // Ensure both lender and borrower are selected
    if (lender === borrower) {
      setMessage("Warning: Lender and borrower cannot be the same person."); // Set warning message
      return; // Exit the function
    }

    try {
      const response = await fetch('/api/lendOne', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lender: lender, borrower: borrower }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error lending token:', error);
      setMessage('Error lending token.');
    }

    // Reset states after lending
    setLender(null);
    setBorrower(null);
    setAction(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <AddUser onUserAdded={handleUserAdded} />
      <div className="relative w-96 h-96 rounded-full bg-gray-200 flex items-center justify-center">
        {/* Circular layout for user names */}
        {users.map((user, index) => {
          const angle = (index / users.length) * (2 * Math.PI); // Calculate angle for the position
          const radius = 120; // Radius of the circle
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={user}
              className={`absolute flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg cursor-pointer transition-transform duration-200
                ${selectedUser === user ? 'bg-cyan-500 text-white' : ''} 
                ${borrower === user ? 'bg-yellow-400 text-white' : ''}`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onClick={() => handleSelectUser(user)}
            >
              {user}
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Selected User: {selectedUser}</h2>
          <button className="mr-2 bg-green-500 text-white p-2 rounded" onClick={() => handleAction('borrow')}>Borrow from Bank</button>
          <button className="bg-yellow-500 text-white p-2 rounded" onClick={() => handleAction('lend')}>Lend to Another User</button>
        </div>
      )}

      {action === 'selectingBorrower' && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Select a Borrower:</h2>
          {borrower && (
            <button className="mt-4 bg-blue-500 text-white p-2 rounded" onClick={handleLendTo}>
              Confirm Lend to {borrower}
            </button>
          )}
        </div>
      )}

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
