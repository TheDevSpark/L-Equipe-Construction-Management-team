"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { signOut } from "@/utils/signOut";
export default function Header() {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const profile = user.user_metadata;
  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (fullName) => {
    return fullName.charAt(0);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Project */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">ProBuild PM</h1>
            <p className="text-sm text-gray-500">Construction Management</p>
          </div>
        </div>

        {/* Right side - User Profile */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition"
            >
              <span className="text-white text-sm font-medium">
                {getInitials(profile?.full_name)}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{profile?.full_name}</div>
                  <div className="text-gray-500">{profile?.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
