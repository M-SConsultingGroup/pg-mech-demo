"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLoggedIn, username, logout, isAdmin } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gradient-cycling flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold text-black">PG Mechanical Board</h1>
      <div className="relative" ref={dropdownRef}>
        {isLoggedIn ? (
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white p-2 rounded shadow-lg transition duration-300"
          >
            <span className="w-8 h-8 flex items-center justify-center bg-gray-500 rounded-full text-white">
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded shadow-lg transition duration-300"
          >
            Sign In
          </button>
        )}
        {dropdownOpen && isLoggedIn && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
            {isAdmin && (
              <button
                onClick={() => router.push('/create-user')}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Create User
              </button>
            )}
            <button
              onClick={() => router.push('/tickets')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Tickets
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}