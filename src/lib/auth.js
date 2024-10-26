import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      credentials: {
        id: { label: "ID", type: "text" },
        username: { label: "Username", type: "text" },
        profileimage: { label: "Profile Image", type: "text" },
      },
      authorize: async ({ id, username, profileimage }) => {
        const user = { id, username, profileimage };
        return user || null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
  },
});
