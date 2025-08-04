import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { LogOutIcon } from "./Icons";
import Avatar from "./Avatar";

const Navbar = ({ user }) => {
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Sign Out Error", error));
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
              Threadify
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.displayName || user.email} />
              <span className="text-slate-300 hidden sm:block">
                {user.displayName || user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-slate-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              <LogOutIcon />
              <span className="hidden sm:block">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
