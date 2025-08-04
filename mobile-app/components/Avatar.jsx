import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { UserIcon } from "./Icons";

const Avatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : null;
  const hasInitial = !!name;

  return (
    <View
      style={[
        styles.avatar,
        hasInitial ? styles.initialBackground : styles.userIconBackground,
      ]}
    >
      {hasInitial ? (
        <Text style={styles.initialText}>{initial}</Text>
      ) : (
        <UserIcon />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999, // Tailwind's 'rounded-full'
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 2,
    borderColor: "#1e293b", // slate-900
    flexShrink: 0,
  },
  initialBackground: {
    backgroundColor: "rgba(12, 74, 110, 0.8)", // sky-800/80
  },
  userIconBackground: {
    backgroundColor: "rgba(51, 65, 85, 0.8)", // slate-700/80
  },
  initialText: {
    color: "#e0f2fe", // sky-200
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default Avatar;
