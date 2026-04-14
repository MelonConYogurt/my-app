"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-100">
      <div className="text-lg font-bold">Logo</div>
      <div className="flex gap-4">
        {session ? (
          <>
            <span>{session.user.email}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
