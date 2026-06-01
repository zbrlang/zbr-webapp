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

  const bots = botsSnapshot.docs.map((botDoc) => {
    const data = botDoc.data();
    return {
      id: botDoc.id,
      name: data.name || "Unnamed Bot", // Note: This might be wrong, settings.name was used before.
      commandCount: data.commandCount || 0,
      variableCount: data.variableCount || 0,
    };
  });

  return NextResponse.json(bots, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
