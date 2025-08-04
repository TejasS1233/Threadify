import React from "react";
import { useState } from "react";
import Avatar from "./Avatar";
import { ReplyIcon, LikeIcon, DislikeIcon } from "./Icons";

function ThreadItem({ thread, allThreads, onReply, onVote, currentUser }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const MAX_TEXT_LENGTH = 300;
  const isLongText = thread.text.length > MAX_TEXT_LENGTH;

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply({ text: replyText, parentId: thread._id, topic: thread.topic });
    setReplyText("");
    setShowReplyBox(false);
  };

  const replies = allThreads.filter(
    (r) => String(r.parentId) === String(thread._id)
  );
  const displayedText =
    isLongText && !isTextExpanded
      ? `${thread.text.substring(0, MAX_TEXT_LENGTH)}...`
      : thread.text;

  const hasLiked = thread.likes?.includes(currentUser.uid);
  const hasDisliked = thread.dislikes?.includes(currentUser.uid);

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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-100">
                  {thread.userName || "Anonymous"}
                </span>
                {thread.topic && (
                  <span className="text-xs font-medium bg-cyan-800/50 text-cyan-300 px-2 py-0.5 rounded-full">
                    {thread.topic}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
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
                onClick={() => setIsTextExpanded(!isTextExpanded)}
                className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 mt-2"
              >
                {isTextExpanded ? "Show Less" : "Show More"}
              </button>
            )}

            <div className="mt-4 flex items-center gap-6">
              <button
                onClick={() => setShowReplyBox((prev) => !prev)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-sky-400 transition-colors duration-200"
              >
                <ReplyIcon /> Reply
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onVote(thread._id, "like")}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 ${
                    hasLiked
                      ? "text-green-400"
                      : "text-slate-400 hover:text-green-400"
                  }`}
                >
                  <LikeIcon filled={hasLiked} /> {thread.likes?.length || 0}
                </button>
                <button
                  onClick={() => onVote(thread._id, "dislike")}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-200 ${
                    hasDisliked
                      ? "text-red-400"
                      : "text-slate-400 hover:text-red-400"
                  }`}
                >
                  <DislikeIcon filled={hasDisliked} />{" "}
                  {thread.dislikes?.length || 0}
                </button>
              </div>
            </div>
          </div>
          {thread.imageUrl && (
            <div
              className={!isImageExpanded ? "image-container-collapsed" : ""}
              onClick={() => setIsImageExpanded(true)}
            >
              <img
                src={thread.imageUrl}
                alt="User upload"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
        {showReplyBox && (
          <div className="mt-4 flex gap-3 animate-fade-in">
            <Avatar name={currentUser.displayName} />
            <div className="flex-1">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Write your reply..."
                rows="2"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700"
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- RE-ENABLED WITH SAFEGUARD --- */}
        {/* This section now renders replies but includes a check to prevent infinite loops. */}
        {replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {replies.map((r) => {
              // --- SAFEGUARD ---
              // If a reply's ID is the same as the current thread's ID, skip rendering it.
              if (r._id === thread._id) {
                console.error(
                  "Infinite loop detected: A thread is its own parent.",
                  r
                );
                return null;
              }
              return (
                <ThreadItem
                  key={r._id}
                  thread={r}
                  allThreads={allThreads}
                  onReply={onReply}
                  onVote={onVote}
                  currentUser={currentUser}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadItem;
