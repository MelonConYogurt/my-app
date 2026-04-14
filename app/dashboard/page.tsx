"use client";

import { useSession } from "next-auth/react";
import Navbar from "../../components/navbar";
import { Link } from "lucide-react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <main>
        <Navbar />

        <p>Signed in as {session?.user?.email ? session.user?.email : "??"}</p>

        <p>Status: {status}</p>
      </main>
    );
  }

  return <Link href="/api/auth/signin">Sign in</Link>;
}
