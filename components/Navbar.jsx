"use client"

import Link from "next/link";
import { signOut } from "next-auth/react";

const Navbar = () => {

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-gray-100">
      <div className="flex gap-6 font-medium">
        <Link href="/dashboard" className="">Dashboard</Link>
        <Link href="/dashboard/task">Task List</Link>
      </div>
      <button
        onClick={() => signOut()}
        className="bg-red-500 text-white font-bold px-6 py-2"
      >
        Log Out
      </button>
    </div>
  );
};

export default Navbar;
