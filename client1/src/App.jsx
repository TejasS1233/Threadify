import React, { useState, useEffect } from "react";
// Make sure your socket.js file is also pointing to your new Render URL!
import { socket } from "./socket";
import "./App.css";

// --- ICONS (Self-contained SVGs for a clean look) ---
const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-send"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </svg>
);

const ReplyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-corner-down-left"
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-slate-500"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const ImageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-image"
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

// --- NEW & MODIFIED COMPONENTS ---

/**
 * Avatar Component
 * Displays the user's initial or a generic icon.
 */
const Avatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : <UserIcon />;
  const hasInitial = !!name;

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ring-2 ring-slate-900 flex-shrink-0 ${
        hasInitial
          ? "bg-sky-800/80 text-sky-200 font-bold text-lg"
          : "bg-slate-700/80"
      }`}
    >
      {initial}
    </div>
  );
};

/**
 * ThreadItem Component
 * MODIFIED: Now collapses long text and displays user's name & avatar.
 */
function ThreadItem({ thread, allThreads, onReply, currentUser }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_TEXT_LENGTH = 300;
  const isLongText = thread.text.length > MAX_TEXT_LENGTH;

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply({ text: replyText, parentId: thread._id });
    setReplyText("");
    setShowReplyBox(false);
  };

  const replies = allThreads.filter((r) => r.parentId === thread._id);

  const displayedText =
    isLongText && !isExpanded
      ? `${thread.text.substring(0, MAX_TEXT_LENGTH)}...`
      : thread.text;

  return (
    <div className="relative flex items-start gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        <Avatar name={thread.userName} />
        {replies.length > 0 && (
          <div className="w-0.5 h-full bg-slate-700/50 mt-2"></div>
        )}
      </div>

      <div className="flex-1">
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/60 rounded-lg shadow-lg border border-slate-700/50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-100">
                {thread.userName || "Anonymous"}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(thread.createdAt).toLocaleString()}
              </span>
            </div>
            {thread.title && (
              <h2 className="text-xl font-bold text-sky-300 mb-3">
                {thread.title}
              </h2>
            )}
            <p className="text-slate-300 whitespace-pre-wrap break-words">
              {displayedText}
            </p>

            {isLongText && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 mt-2"
              >
                {isExpanded ? "Show Less" : "Show More"}
              </button>
            )}

            <div className="mt-3">
              <button
                onClick={() => setShowReplyBox((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors duration-200"
              >
                <ReplyIcon />
                Reply
              </button>
            </div>
          </div>
          {thread.imageUrl && (
            <img
              src={thread.imageUrl}
              alt="User upload"
              className="w-full h-auto object-cover rounded-b-lg mt-2"
            />
          )}
        </div>

        {showReplyBox && (
          <div className="mt-4 flex gap-3 animate-fade-in">
            <Avatar name={currentUser} />
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                placeholder="Write your reply..."
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {replies.map((r) => (
              <ThreadItem
                key={r._id}
                thread={r}
                allThreads={allThreads}
                onReply={onReply}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main App Component
 */
export default function App() {
  const [threads, setThreads] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);

  useEffect(() => {
    // Check for a saved name in local storage
    const savedName = localStorage.getItem("userName");
    if (savedName) {
      setUserName(savedName);
      setIsNameSet(true);
    }

    // UPDATED: Fetch threads from your live Render backend
    fetch("https://threadify-1.onrender.com/threads")
      .then((res) => res.json())
      .then(setThreads)
      .catch((err) => console.error("Failed to fetch threads:", err));

    socket.on("new-thread", (thread) => {
      setThreads((prev) => [...prev, thread]);
    });

    return () => {
      socket.off("new-thread");
    };
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      const finalName = nameInput.trim();
      localStorage.setItem("userName", finalName);
      setUserName(finalName);
      setIsNameSet(true);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addThread = async ({ title, text, parentId = null }) => {
    if (!text.trim() || (!parentId && !title.trim())) return;

    const imageUrl = imagePreview;

    try {
      // UPDATED: Post new threads to your live Render backend
      await fetch("https://threadify-1.onrender.com/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Add userName to the request body
        body: JSON.stringify({ title, text, parentId, imageUrl, userName }),
      });

      if (!parentId) {
        setNewTitle("");
        setNewText("");
        setNewImage(null);
        setImagePreview("");
      }
    } catch (err) {
      console.error("Failed to add thread:", err);
    }
  };

  const rootThreads = threads.filter((t) => !t.parentId);

  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <form
            onSubmit={handleNameSubmit}
            className="bg-slate-800/50 p-8 rounded-xl shadow-2xl border border-slate-700 text-center"
          >
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
              Welcome to Threadify
            </h1>
            <p className="text-slate-400 mb-6">
              Enter your name to join the discussion.
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your Name"
              className="w-full p-3 mb-4 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="w-full bg-sky-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-sky-700 transition-all duration-200 disabled:opacity-50"
              disabled={!nameInput.trim()}
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
            Threadify
          </h1>
          <p className="text-slate-400">
            Welcome, <span className="font-bold text-sky-400">{userName}</span>!
          </p>
        </header>

        {/* New Thread Input Form */}
        <div className="bg-slate-800/50 p-4 rounded-xl shadow-2xl mb-10 border border-slate-700 max-w-4xl mx-auto">
          <div className="flex gap-4 items-start">
            <div className="mt-2">
              <Avatar name={userName} />
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300 resize-none"
                rows="4"
              />
            </div>
          </div>
          {imagePreview && (
            <div className="pl-16 mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs rounded-lg"
              />
            </div>
          )}
          <div className="flex justify-between items-center mt-3 pl-16">
            <label className="cursor-pointer text-slate-400 hover:text-sky-400 transition-colors">
              <ImageIcon />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <button
              onClick={() => addThread({ title: newTitle, text: newText })}
              className="bg-sky-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-sky-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-600/20 hover:shadow-sky-600/40"
              disabled={!newText.trim() || !newTitle.trim()}
            >
              <SendIcon />
              Post Thread
            </button>
          </div>
        </div>

        <main className="space-y-6 max-w-4xl mx-auto">
          {threads.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-slate-400">
                It's quiet in here...
              </h3>
              <p className="text-slate-500 mt-2">
                Be the first to start a discussion!
              </p>
            </div>
          )}
          {rootThreads.map((t) => (
            <ThreadItem
              key={t._id}
              thread={t}
              allThreads={threads}
              onReply={addThread}
              currentUser={userName}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
