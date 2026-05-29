import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

export async function GET(request: NextRequest) {
  let discordId;
  try {
    discordId = await getDiscordId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const botsSnapshot = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .get();

  const bots = await Promise.all(
    botsSnapshot.docs.map(async (botDoc) => {
      const commands = await botDoc.ref.collection("commands").get();
      const variables = await botDoc.ref.collection("variables").get();
      const settings = await botDoc.ref.collection("config").doc("settings").get();
      
      return {
        id: botDoc.id,
        name: settings.data()?.name || "Unnamed Bot",
        commandCount: commands.size,
        variableCount: variables.size,
      };
    })
  );

  return NextResponse.json(bots, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
