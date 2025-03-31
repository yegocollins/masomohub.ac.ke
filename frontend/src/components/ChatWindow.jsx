import { useState } from "react";
import { Bold, Italic, Link, Paperclip, Send, Text } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { chatService } from "../services/api";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const sendMessage = async (e) => {
    e.preventDefault();
    if (submitting || !input.trim()) return; // Prevent multiple submissions or empty messages
    setSubmitting(true);

    try {
      const chatData = {
        studentId: user._id, // ID of the current student
        message: input, // The content of the message
      };
      const response = await chatService.createChat(chatData);
      setMessages((prevMessages) => [...prevMessages, response]); // Append the new message and response
      setInput(""); // Clear input field
    } catch (error) {
      console.error("Error sending chat", error);
      alert("Failed to send chat. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Chat Assistant</h2>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-lg shadow-inner">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col space-y-1">
            {/* User Message */}
            {msg.message && (
              <div className="self-end bg-blue-500 text-white p-3 rounded-lg max-w-xs shadow-md">
                {msg.message}
              </div>
            )}
            {/* Chat Response */}
            {msg.chat_response && (
              <div className="self-start bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs shadow-md">
                {msg.chat_response}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="mt-4 border rounded-lg p-4 bg-white shadow-md">
        <div className="flex items-center space-x-2 mb-2">
          <Bold className="text-gray-500 cursor-pointer" size={18} />
          <Italic className="text-gray-500 cursor-pointer" size={18} />
          <Text className="text-gray-500 cursor-pointer" size={18} />
          <Link className="text-gray-500 cursor-pointer" size={18} />
          <Paperclip className="ml-auto text-gray-500 cursor-pointer" size={18} />
        </div>
        <textarea
          className="w-full border rounded-md p-2 outline-none text-gray-700 resize-none"
          placeholder="Type your message here..."
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>
        <div className="flex items-center justify-between mt-2">
          <button
            className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md flex items-center ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={sendMessage}
            disabled={submitting}
          >
            <Send size={18} className="mr-1" /> {submitting ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
