import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import Navbar from "./Navbar";
import ThreadItem from "./ThreadItem";
import Avatar from "./Avatar";
import { SendIcon, ImageIcon } from "./Icons";

const ThreadifyApp = ({ user }) => {
  const [threads, setThreads] = useState([]);
  const [topics, setTopics] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/threads")
      .then((res) => res.json())
      .then(setThreads);
    fetch("http://localhost:5000/api/topics")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        if (data.length > 0) setSelectedTopic(data[0].name);
      });

    const handleNewThread = (thread) => {
      setThreads((prev) => [thread, ...prev]);
    };

    const handleUpdateThread = (updatedThread) => {
      setThreads((prevThreads) =>
        prevThreads.map((t) =>
          t._id === updatedThread._id ? updatedThread : t
        )
      );
    };

    socket.on("new-thread", handleNewThread);
    socket.on("update-thread", handleUpdateThread);

    return () => {
      socket.off("new-thread", handleNewThread);
      socket.off("update-thread", handleUpdateThread);
    };
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addThread = async ({ title, text, parentId = null, topic }) => {
    const finalTopic = isCreatingNewTopic ? newTopicInput : selectedTopic;
    if (
      !text.trim() ||
      (!parentId && !title.trim()) ||
      (!parentId && !finalTopic.trim())
    ) {
      return alert("Title, text, and topic are required.");
    }

    let imageUrl = "";
    const token = await user.getIdToken();

    if (imageFile) {
      try {
        const signatureResponse = await fetch(
          "http://localhost:5000/api/upload/signature",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!signatureResponse.ok)
          throw new Error("Failed to get upload signature.");
        const { signature, timestamp } = await signatureResponse.json();

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("timestamp", timestamp);
        formData.append("signature", signature);
        formData.append("api_key", import.meta.env.VITE_CLOUDINARY_API_KEY);

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!cloudinaryResponse.ok) {
          const errorData = await cloudinaryResponse.json();
          throw new Error(
            `Cloudinary upload failed: ${errorData.error.message}`
          );
        }

        const cloudinaryData = await cloudinaryResponse.json();
        imageUrl = cloudinaryData.secure_url;
      } catch (uploadError) {
        console.error("Image upload failed:", uploadError);
        alert(
          "Sorry, there was an error uploading your image. Please check the console for details."
        );
        return;
      }
    }

    try {
      const response = await fetch("http://localhost:5000/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          text,
          parentId,
          imageUrl,
          topic: finalTopic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create thread on the server.");
      }

      const newThread = await response.json();
      setThreads((prev) => [newThread, ...prev]);

      if (!parentId) {
        setNewTitle("");
        setNewText("");
        if (topics.length > 0) setSelectedTopic(topics[0].name);
        setNewTopicInput("");
        setIsCreatingNewTopic(false);
        setImageFile(null);
        setImagePreview("");
      }
    } catch (err) {
      console.error("Failed to add thread:", err);
    }
  };

  const handleVote = async (threadId, voteType) => {
    try {
      const token = await user.getIdToken();
      await fetch(`http://localhost:5000/threads/${threadId}/${voteType}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error(`Error ${voteType}ing thread:`, error);
    }
  };

  const rootThreads = threads.filter((t) => !t.parentId);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-white">
      <style>{`
        .image-container-collapsed { max-height: 500px; overflow: hidden; position: relative; cursor: pointer; border-radius: 0 0 0.5rem 0.5rem; }
        .image-container-collapsed::after { content: 'Show More'; position: absolute; bottom: 0; left: 0; width: 100%; text-align: center; padding: 2rem 0; background: linear-gradient(to top, rgba(15, 23, 42, 1), rgba(15, 23, 42, 0.8), transparent); color: #e2e8f0; font-weight: 600; transition: background 0.2s; }
        .image-container-collapsed:hover::after { background: linear-gradient(to top, rgba(10, 18, 35, 1), rgba(10, 18, 35, 0.8), transparent); }
      `}</style>
      <Navbar user={user} />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-800/50 p-4 rounded-xl shadow-2xl mb-10 border border-slate-700">
          <div className="flex gap-4 items-start">
            <div className="mt-2">
              <Avatar name={user.displayName} />
            </div>
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg"
              />
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg"
                rows="4"
              />
              {isCreatingNewTopic ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    placeholder="Enter new topic name"
                    className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg"
                  />
                  <button
                    onClick={() => setIsCreatingNewTopic(false)}
                    className="bg-slate-600 text-white font-semibold px-4 rounded-lg hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-lg"
                  >
                    {topics.map((topic) => (
                      <option key={topic._id} value={topic.name}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreatingNewTopic(true)}
                    className="bg-sky-600 text-white font-semibold px-4 rounded-lg hover:bg-sky-700 whitespace-nowrap"
                  >
                    New Topic
                  </button>
                </div>
              )}
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
            <label className="cursor-pointer text-slate-400 hover:text-sky-400">
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
              className="bg-sky-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-sky-700 flex items-center gap-2 disabled:opacity-50"
              disabled={!newText.trim() || !newTitle.trim()}
            >
              <SendIcon /> Post Thread
            </button>
          </div>
        </div>
        <main className="space-y-6">
          {rootThreads.length === 0 && (
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
              onVote={handleVote}
              currentUser={user}
            />
          ))}
        </main>
      </div>
    </div>
  );
};

export default ThreadifyApp;
