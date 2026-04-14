import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const baseUrl = process.env.APIHOST;

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
        //Validate user in the backend
        const res = await fetch(`${baseUrl}/users/validate`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const user = await res.json();

        // If no error and we have user data, return it
        if (res.ok && user) {
          return user;
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
});

export { handler as GET, handler as POST };
