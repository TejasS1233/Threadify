import React from "react";
import { UserIcon } from "./Icons";

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

export default Avatar;
