import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Navbar from "./NavBar";
import ThreadItem from "./ThreadItem";
import Avatar from "./Avatar";
import { SendIcon, ImageIcon } from "./Icons";
import axios from "axios";

// NOTE: You will need to replace this with your machine's local IP address
// or your deployed backend URL. 'localhost' won't work on an emulator.
const API_BASE_URL = "http://10.0.2.2:5000";

const ThreadifyApp = ({ user }) => {
  const [threads, setThreads] = useState([]);
  const [topics, setTopics] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [newTopicInput, setNewTopicInput] = useState("");
  const [isCreatingNewTopic, setIsCreatingNewTopic] = useState(false);
  const [loading, setLoading] = useState(true);

  // NOTE: Image upload logic needs to be rewritten for React Native.
  // We will provide a simplified example without image upload.
  const handleImageUpload = () => {
    // Implement native image picker and upload logic here
    alert("Image upload functionality not implemented in this demo.");
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const threadsRes = await axios.get(`${API_BASE_URL}/threads`);
        const topicsRes = await axios.get(`${API_BASE_URL}/api/topics`);
        setThreads(threadsRes.data);
        setTopics(topicsRes.data);
        if (topicsRes.data.length > 0) setSelectedTopic(topicsRes.data[0].name);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const addThread = async ({ title, text, parentId = null, topic }) => {
    const finalTopic = isCreatingNewTopic ? newTopicInput : selectedTopic;
    if (
      !text.trim() ||
      (!parentId && !title.trim()) ||
      (!parentId && !finalTopic.trim())
    ) {
      alert("Title, text, and topic are required.");
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/threads`,
        {
          title,
          text,
          parentId,
          imageUrl: null, // Image upload not implemented
          topic: finalTopic,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newThread = response.data;
      setThreads((prev) => [newThread, ...prev]);

      if (!parentId) {
        setNewTitle("");
        setNewText("");
        setNewTopicInput("");
        setIsCreatingNewTopic(false);
      }
    } catch (err) {
      console.error("Failed to add thread:", err);
      alert("Failed to add thread. Please check the console for errors.");
    }
  };

  const handleVote = async (threadId, voteType) => {
    try {
      const token = await user.getIdToken();
      await axios.post(
        `${API_BASE_URL}/threads/${threadId}/${voteType}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Optimistically update the UI. Re-fetching data is not ideal for real-time.
      // A more robust solution would use web sockets for real-time updates.
      setThreads((prevThreads) =>
        prevThreads.map((t) => {
          if (t._id === threadId) {
            const newLikes = new Set(t.likes || []);
            const newDislikes = new Set(t.dislikes || []);
            if (voteType === "like") {
              if (newLikes.has(user.uid)) {
                newLikes.delete(user.uid);
              } else {
                newLikes.add(user.uid);
                newDislikes.delete(user.uid);
              }
            } else if (voteType === "dislike") {
              if (newDislikes.has(user.uid)) {
                newDislikes.delete(user.uid);
              } else {
                newDislikes.add(user.uid);
                newLikes.delete(user.uid);
              }
            }
            return {
              ...t,
              likes: Array.from(newLikes),
              dislikes: Array.from(newDislikes),
            };
          }
          return t;
        })
      );
    } catch (error) {
      console.error(`Error ${voteType}ing thread:`, error);
    }
  };

  const rootThreads = threads.filter((t) => !t.parentId);

  return (
    <View style={styles.container}>
      <Navbar user={user} />
      <View style={styles.mainContent}>
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <View style={{ marginTop: 8 }}>
              <Avatar name={user.displayName} />
            </View>
            <View style={styles.inputSection}>
              <TextInput
                style={[styles.input, styles.inputTitle]}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Title"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                style={[styles.input, styles.inputTextarea]}
                value={newText}
                onChangeText={setNewText}
                placeholder="What's on your mind?"
                placeholderTextColor="#94a3b8"
                multiline
                rows={4}
              />
              {isCreatingNewTopic ? (
                <View style={styles.newTopicContainer}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={newTopicInput}
                    onChangeText={setNewTopicInput}
                    placeholder="Enter new topic name"
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity
                    onPress={() => setIsCreatingNewTopic(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.topicSelectContainer}>
                  <Picker
                    selectedValue={selectedTopic}
                    onValueChange={(itemValue) => setSelectedTopic(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#94a3b8"
                  >
                    {topics.map((topic) => (
                      <Picker.Item
                        key={topic._id}
                        label={topic.name}
                        value={topic.name}
                      />
                    ))}
                  </Picker>
                  <TouchableOpacity
                    onPress={() => setIsCreatingNewTopic(true)}
                    style={styles.newTopicButton}
                  >
                    <Text style={styles.newTopicButtonText}>New Topic</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={handleImageUpload}
              style={styles.imageButton}
            >
              <ImageIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => addThread({ title: newTitle, text: newText })}
              style={styles.postButton}
              disabled={!newText.trim() || !newTitle.trim()}
            >
              <SendIcon color="#fff" />
              <Text style={styles.postButtonText}>Post Thread</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007aff" />
          </View>
        ) : rootThreads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>It's quiet in here...</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to start a discussion!
            </Text>
          </View>
        ) : (
          <FlatList
            data={rootThreads}
            renderItem={({ item }) => (
              <ThreadItem
                thread={item}
                allThreads={threads}
                onReply={addThread}
                onVote={handleVote}
                currentUser={user}
              />
            )}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.threadList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  inputCard: {
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  inputSection: {
    flex: 1,
    gap: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    color: "#fff",
  },
  inputTitle: {
    fontSize: 16,
  },
  inputTextarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  newTopicContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#475569",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  topicSelectContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    color: "#fff",
  },
  newTopicButton: {
    backgroundColor: "#007aff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    whiteSpace: "nowrap",
  },
  newTopicButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingLeft: 56, // to align with the text inputs
  },
  imageButton: {
    // Custom styles for the image button
  },
  postButton: {
    backgroundColor: "#007aff",
    color: "#fff",
    fontWeight: "bold",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#94a3b8",
  },
  emptySubtitle: {
    color: "#64748b",
    marginTop: 8,
  },
  threadList: {
    gap: 24,
  },
});

export default ThreadifyApp;
