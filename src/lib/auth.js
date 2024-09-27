import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      credentials: {
        id: { label: "ID", type: "text" },
        username: { label: "Username", type: "text" },
        about: { label: "About", type: "text" },
        profileimage: { label: "Profile Image", type: "text" },
      },
      authorize: async ({ id, username, about, profileimage }) => {
        const user = { id, username, about, profileimage };
        return user || null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.about = user.about;
        token.profileimage = user.profileimage;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.about = token.about;
      session.user.profileimage = token.profileimage;
      return session;
    },
  },
});
