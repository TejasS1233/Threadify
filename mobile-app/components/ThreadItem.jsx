import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import Avatar from "./Avatar";
import { ReplyIcon, LikeIcon, DislikeIcon, SendIcon } from "./Icons";

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
    <View style={styles.threadContainer}>
      <View style={styles.avatarColumn}>
        <Avatar name={thread.userName} />
        {replies.length > 0 && <View style={styles.verticalLine}></View>}
      </View>
      <View style={styles.contentColumn}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {thread.userName || "Anonymous"}
              </Text>
              {thread.topic && (
                <View style={styles.topicBadge}>
                  <Text style={styles.topicText}>{thread.topic}</Text>
                </View>
              )}
            </View>
            <Text style={styles.dateText}>
              {new Date(thread.createdAt).toLocaleString()}
            </Text>
          </View>
          {thread.title && (
            <Text style={styles.threadTitle}>{thread.title}</Text>
          )}
          <Text style={styles.threadText}>{displayedText}</Text>
          {isLongText && (
            <TouchableOpacity
              onPress={() => setIsTextExpanded(!isTextExpanded)}
            >
              <Text style={styles.showMoreText}>
                {isTextExpanded ? "Show Less" : "Show More"}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => setShowReplyBox((prev) => !prev)}
              style={styles.actionButton}
            >
              <ReplyIcon color="#94a3b8" />
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
            <View style={styles.voteContainer}>
              <TouchableOpacity
                onPress={() => onVote(thread._id, "like")}
                style={styles.voteButton}
              >
                <LikeIcon
                  filled={hasLiked}
                  color={hasLiked ? "#34d399" : "#94a3b8"}
                />
                <Text
                  style={[styles.voteText, hasLiked && { color: "#34d399" }]}
                >
                  {thread.likes?.length || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onVote(thread._id, "dislike")}
                style={styles.voteButton}
              >
                <DislikeIcon
                  filled={hasDisliked}
                  color={hasDisliked ? "#ef4444" : "#94a3b8"}
                />
                <Text
                  style={[styles.voteText, hasDisliked && { color: "#ef4444" }]}
                >
                  {thread.dislikes?.length || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {thread.imageUrl && (
            <TouchableOpacity
              onPress={() => setIsImageExpanded(true)}
              disabled={isImageExpanded}
              style={[!isImageExpanded && styles.imageCollapsed]}
            >
              <Image
                source={{ uri: thread.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {showReplyBox && (
          <View style={styles.replyBoxContainer}>
            <Avatar name={currentUser.displayName} />
            <View style={styles.replyInputContainer}>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                style={styles.replyInput}
                placeholder="Write your reply..."
                placeholderTextColor="#94a3b8"
                multiline
              />
              <TouchableOpacity
                onPress={handleReply}
                style={styles.sendReplyButton}
                disabled={!replyText.trim()}
              >
                <Text style={styles.sendReplyText}>Send Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map((r) => {
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
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  threadContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarColumn: {
    flexDirection: "column",
    alignItems: "center",
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(51, 65, 85, 0.5)",
    marginTop: 8,
  },
  contentColumn: {
    flex: 1,
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(51, 65, 85, 0.5)",
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontWeight: "bold",
    color: "#f8fafc",
  },
  topicBadge: {
    backgroundColor: "rgba(8, 145, 178, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  topicText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#67e8f9",
  },
  dateText: {
    fontSize: 10,
    color: "#94a3b8",
    flexShrink: 0,
    marginLeft: 8,
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007aff",
    marginBottom: 12,
  },
  threadText: {
    color: "#cbd5e1",
  },
  showMoreText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#67e8f9",
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  voteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  voteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  voteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  imageCollapsed: {
    maxHeight: 200,
    overflow: "hidden",
    position: "relative",
    borderRadius: 8,
    marginTop: 16,
  },
  image: {
    width: "100%",
    height: 300, // A fixed height for a better layout
    borderRadius: 8,
    marginTop: 16,
  },
  replyBoxContainer: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  replyInputContainer: {
    flex: 1,
    gap: 8,
  },
  replyInput: {
    width: "100%",
    minHeight: 80,
    padding: 12,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    color: "#e2e8f0",
  },
  sendReplyButton: {
    backgroundColor: "#007aff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  sendReplyText: {
    color: "#fff",
    fontWeight: "bold",
  },
  repliesContainer: {
    marginTop: 16,
    gap: 16,
  },
});

export default ThreadItem;
