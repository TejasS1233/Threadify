import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Assuming you have a firebase.js setup
import { LogOutIcon } from "./Icons";
import Avatar from "./Avatar";

const Navbar = ({ user }) => {
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign Out Error", error));
  };

  return (
    <View style={styles.nav}>
      <View style={styles.navContent}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Threadify</Text>
        </View>
        <View style={styles.userInfoContainer}>
          <View style={styles.userSection}>
            <Avatar name={user.displayName || user.email} />
            <Text style={styles.userName}>
              {user.displayName || user.email}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <LogOutIcon color="#fff" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "rgba(30, 41, 59, 0.5)", // slate-800/50
    borderBottomWidth: 1,
    borderBottomColor: "#334155", // slate-700
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007aff", // Replaced gradient with a solid color
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    color: "#cbd5e1", // slate-300
    display: "none", // hidden sm:block, needs responsive logic in RN
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#334155", // slate-700
    color: "#fff",
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Navbar;
