import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

import { decrypt } from "@/lib/crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  let discordId;
  try {
    discordId = await getDiscordId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settingsDoc = await db
    .collection("users").doc(discordId)
    .collection("bots").doc(botId)
    .collection("config").doc("settings")
    .get();
        
  const settings = settingsDoc.data();
  const token = settings?.botToken ? decrypt(settings.botToken) : null;
  const botInternalId = settings?.botId;
  const botName = settings?.name || "Unnamed Bot";

  let avatar = null;
  let banner = null;
  
  if (token && botInternalId) {
    try {
      const res = await fetch(`https://discord.com/api/v10/users/${botInternalId}`, {
          headers: { Authorization: `Bot ${token}` }
      });
      if (res.ok) {
          const data = await res.json();
          if (data.avatar) {
            const ext = data.avatar.startsWith("a_") ? "gif" : "png";
            avatar = `https://cdn.discordapp.com/avatars/${botInternalId}/${data.avatar}.${ext}?size=256`;
          }
          if (data.banner) {
            const ext = data.banner.startsWith("a_") ? "gif" : "png";
            banner = `https://cdn.discordapp.com/banners/${botInternalId}/${data.banner}.${ext}?size=600`;
          }
      }
    } catch (e) {
      console.error("Error fetching bot meta:", e);
    }
  }
  
  return NextResponse.json(
    { avatar, banner, name: botName },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
  );
}
