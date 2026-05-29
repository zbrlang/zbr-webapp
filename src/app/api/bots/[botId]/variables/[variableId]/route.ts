import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; variableId: string }> }
) {
  const { botId, variableId } = await params;
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
    .collection("variables")
    .doc(variableId)
    .update(data);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; variableId: string }> }
) {
  const { botId, variableId } = await params;
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
    .collection("variables")
    .doc(variableId)
    .delete();

  return NextResponse.json({ success: true });
}
