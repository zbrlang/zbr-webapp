import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter";
import { db } from "@/lib/firebase";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: FirestoreAdapter(db),
  ...authConfig,
})

export async function getDiscordId(): Promise<string> {
  if (process.env.NODE_ENV === "development") {
    return "test-user-id";
  }
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}
