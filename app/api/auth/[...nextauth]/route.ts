import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: User & DefaultSession["user"];
    token: string;
  }

  interface User {
    role?: string;
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    role?: string;
    id?: string;
  }
}

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const handler = NextAuth({
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "ejemplo@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "ejemplo",
        },
      },
      async authorize(credentials) {
        const res = await fetch(`${NEXT_PUBLIC_API_URL}/users/validate`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const user = await res.json();
        if (res.ok && user) {
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
