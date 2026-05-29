import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let discordId;
  try {
    discordId = await getDiscordId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, token } = await request.json();

  let botIdFromToken = null;
  if (token) {
    try {
        const response = await fetch("https://discord.com/api/v10/users/@me", {
            headers: { Authorization: `Bot ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            botIdFromToken = data.id;
        }
    } catch(e) {
        console.error("Failed to fetch bot ID", e);
    }
  }

  const botRef = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .add({});

  const settings: any = { name };
  if (token) {
    settings.botToken = Buffer.from(token).toString('base64');
  }
  if (botIdFromToken) {
    settings.botId = botIdFromToken;
  }

  await botRef
    .collection("config")
    .doc("settings")
    .set(settings);

  return NextResponse.json({ botId: botRef.id, error: botIdFromToken ? null : "Token invalid" });
}
