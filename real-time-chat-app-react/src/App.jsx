import React, { useState, useEffect, useCallback, useRef } from "react";
import io from "socket.io-client";


const ChatApp = () => {
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const socketRef = useRef(null); // ✅ Hold socket in a ref


  // Listen for messages
  const handleNewMessage = (data) => {
    setMessages((prevMessages) => [data, ...prevMessages]);
  };

  // Listen for user updates
  const handleUserUpdate = (userList) => {
    console.log(userList);
    setUsers(userList);
  };

  const joinChat = () => {
    if (username.trim()) {
      socketRef.current = io("http://localhost:5000"); // ✅ New socket instance
      socketRef.current.emit("join", username);
      socketRef.current.on("message", handleNewMessage);
      socketRef.current.on("users", handleUserUpdate);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      socketRef.current.emit("sendMessage", { username, message });
      setMessage("");
    }
  };

  const logout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect(); // ✅ disconnect the socket
      socketRef.current = null;
    }
    setUsername("");
    setJoined(false);
    setMessages([]);
    setUsers([]);
  };

  const onChangeUsername = useCallback((e) => setUsername(e.target.value),[])

  return (
    <div className="chat-container">
      {!joined ? (
        <div className="chat-header">
          <h2>Enter Your Name</h2>
          <div className="username-input">
            <input
              type="text"
              placeholder="Username..."
              value={username}
              onChange={onChangeUsername}
            />
            <button onClick={joinChat}>Join Chat</button>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-header joined">
            <div>Welcome, {username}!</div>
            <button onClick={logout}>Logout</button>
          </div>

          <div className="users">
            <strong>Online Users:</strong> {users.join(", ")}
          </div>

          <div className="message-list">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.username === username ? "me " : ""}${
                  msg.message.includes("joined the chat.") ||
                  msg.message.includes("has left the chat.")
                    ? "system"
                    : ""
                }`}
              >
                <strong>{msg.username}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatApp;
