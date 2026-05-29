import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  const { botId, commandId } = await params;
  let discordId;
  try {
    discordId = await getDiscordId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();

  await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("commands")
    .doc(commandId)
    .set(data, { merge: true });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  const { botId, commandId } = await params;
  let discordId;
  try {
    discordId = await getDiscordId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("commands")
    .doc(commandId)
    .delete();

  return NextResponse.json({ success: true });
}
