import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

import { encrypt, decrypt } from "@/lib/crypto";

async function getBotIdFromToken(token: string) {
  try {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bot ${token}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.id;
  } catch (e) {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();

  const doc = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("config")
    .doc("settings")
    .get();

  if (!doc.exists) return NextResponse.json({});
  
  const data = doc.data();
  if (data?.botToken) {
    data.botToken = decrypt(data.botToken);
  }

  return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();
  const data = await request.json();

  const settings: any = { ...data };
  let tokenError = false;
  
  if (settings.botToken) {
    console.log("Token received (first 10):", settings.botToken?.substring(0, 10));
    const id = await getBotIdFromToken(settings.botToken);
    console.log("Discord API response for bot ID:", id);
    if (id) {
        settings.botId = id;
    } else {
        tokenError = true;
    }
    settings.botToken = encrypt(settings.botToken);
    console.log("Writing to Firestore (settings data):", { ...settings, botToken: settings.botToken?.substring(0, 10) + "..." });
  }

  await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("config")
    .doc("settings")
    .set(settings, { merge: true });

  return NextResponse.json({ success: true, tokenError });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();

  const botRef = db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId);

  // Firestore Admin recursive delete
  await db.recursiveDelete(botRef);

  return NextResponse.json({ success: true });
}
