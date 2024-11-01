"use client";
import { useEffect, useState } from "react";
import AddUser from "../components/AddUser"; // Ensure the import path is correct

export default function GameTable() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lender, setLender] = useState(null);
  const [action, setAction] = useState(null);
  const [message, setMessage] = useState("");
  const [borrower, setBorrower] = useState(null);
  const [summary, setSummary] = useState(""); // State to hold the summary

  // Function to handle when a user is added
  const handleUserAdded = (name) => {
    console.log(`User added: ${name}`);
    setUsers((prevUsers) => [...prevUsers, name]);
  };

  // Fetch users from API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/getUsers");
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    if (action === "selectingBorrower") {
      if (selectedUser === user) {
        setBorrower(null);
        setSelectedUser(null);
        setAction(null);
      } else {
        setBorrower(user);
      }
    } else {
      if (selectedUser === user) {
        setSelectedUser(null);
      } else {
        setSelectedUser(user);
      }
    }
  };

  const handleAction = async (actionType) => {
    if (actionType === "borrow") {
      try {
        const response = await fetch("/api/borrowFromBank", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user: selectedUser }),
        });
        const data = await response.json();
        setMessage(data.message);
      } catch (error) {
        console.error("Error borrowing from bank:", error);
        setMessage("Error borrowing from bank.");
      }
    } else if (actionType === "lend") {
      setLender(selectedUser);
      setAction("selectingBorrower");
    }
  };

  const handleReturnToBank = async () => {
    if (!selectedUser) {
      setMessage("No user selected.");
      return;
    }

    try {
      const response = await fetch("/api/returnToBank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: selectedUser }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error returning token to bank:", error);
      setMessage("Error returning token to bank.");
    }
  };

  const handleLendTo = async () => {
    if (!lender || !borrower) return;
    if (lender === borrower) {
      setMessage("Warning: Lender and borrower cannot be the same person.");
      return;
    }

    try {
      const response = await fetch("/api/lendOne", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lender: lender, borrower: borrower }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error lending token:", error);
      setMessage("Error lending token.");
    }

    setLender(null);
    setBorrower(null);
    setAction(null);
  };

  // Function to handle deleting a user
  const handleDeleteUser = async (user) => {
    try {
      const response = await fetch("/api/deleteUser", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      const data = await response.json();
      if (response.ok) {
        setUsers((prevUsers) => prevUsers.filter((u) => u !== user));
        setMessage(data.message);
      } else {
        setMessage("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setMessage("Error deleting user.");
    }
  };

  const handleTouchStart = (user) => {
    const event = new TouchEvent("touchmove", {
      bubbles: true,
      cancelable: true,
      touches: [new Touch({ identifier: Date.now(), target: document.createElement('div'), clientX: 0, clientY: 0 })],
    });
    event.dataTransfer = { getData: () => user };
    document.dispatchEvent(event);
  };

  const handleTouchEnd = (user) => {
    handleDeleteUser(user);
  };

  // Fetch summary from API
  const handleFetchSummary = async () => {
    try {
      const response = await fetch("/api/summary");
      const data = await response.json();
      setSummary(data.message); // Set summary message from API response
    } catch (error) {
      console.error("Error fetching summary:", error);
      setMessage("Error fetching summary.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <div className="flex mt-10 items-center">
        <AddUser onUserAdded={handleUserAdded} />
        <div
          className="w-16 h-18 rounded-full flex items-center justify-center text-white text-lg font-bold cursor-pointer ml-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const user = e.dataTransfer.getData("text/plain");
            handleDeleteUser(user);
          }}
          onTouchEnd={() => {
            if (selectedUser) {
              handleDeleteUser(selectedUser);
            }
          }}
        >
          🗑️
        </div>
      </div>

      <div className="relative w-96 h-96 rounded-full bg-gray-200 flex items-center justify-center">
        {users.map((user, index) => {
          const angle = (index / users.length) * (2 * Math.PI);
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={user}
              className={`absolute flex items-center justify-center w-16 h-16 rounded-full shadow-lg cursor-pointer transition-transform duration-200
                ${selectedUser === user ? "bg-cyan-500 text-white" : ""} 
                ${borrower === user ? "bg-yellow-500 text-white" : ""}`}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              onClick={() => handleSelectUser(user)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", user);
              }}
              onTouchStart={() => handleTouchStart(user)}
              onTouchEnd={() => handleTouchEnd(user)}
            >
              {user}
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Selected User: {selectedUser}</h2>
          <button
            className="mr-2 bg-green-500 text-white p-2 rounded"
            onClick={() => handleAction("borrow")}
          >
            Borrow from Bank
          </button>
          <button
            className="mr-2 bg-blue-500 text-white p-2 rounded"
            onClick={handleReturnToBank}
          >
            Return to Bank
          </button>
          <button
            className="bg-yellow-500 text-white p-2 rounded"
            onClick={() => handleAction("lend")}
          >
            Lend to Another User
          </button>
        </div>
      )}

      {action === "selectingBorrower" && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Select a Borrower:</h2>
          {borrower && (
            <button
              className="mt-4 bg-cyan-500 text-white p-2 rounded"
              onClick={handleLendTo}
            >
              Confirm Lend to {borrower}
            </button>
          )}
        </div>
      )}

      {message && <p className="mt-4 text-red-500">{message}</p>}

      {/* Fetch Summary Button */}
      <div className="fixed bottom-10 left-0 right-0 bg-white p-4 shadow flex justify-between">
    <button
      className="bg-blue-600 text-white p-2 rounded"
      onClick={handleFetchSummary}
    >
      Fetch Summary
    </button>

    {/* Summary Section */}
    {summary && (
      <div className="ml-4 w-full">
        <h2 className="text-lg font-semibold">Summary:</h2>
        <pre className="whitespace-pre-wrap text-sm text-gray-700">{summary}</pre>
      </div>
    )}
  </div>
    </div>
  );
}
