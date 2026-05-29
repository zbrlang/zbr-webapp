import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { db } from "@/lib/firebase";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: FirestoreAdapter(db),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
})

export async function getDiscordId(): Promise<string> {
  if (process.env.NODE_ENV === "development") {
    return "test-user-id";
  }
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}
