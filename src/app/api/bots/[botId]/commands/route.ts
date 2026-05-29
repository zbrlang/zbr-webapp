import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const { searchParams } = new URL(request.url);
  const commandId = searchParams.get("id");
  let discordId;
  try {
    discordId = await getDiscordId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (commandId) {
    const doc = await db
      .collection("users")
      .doc(discordId)
      .collection("bots")
      .doc(botId)
      .collection("commands")
      .doc(commandId)
      .get();
    return NextResponse.json(doc.exists ? { id: doc.id, ...doc.data() } : null, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
  }

  const commandsSnapshot = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("commands")
    .get();

  const commands = commandsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(commands, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(
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
  const data = await request.json();

  const docRef = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("commands")
    .add(data);

  console.log("Firestore write success:", docRef.id);
  return NextResponse.json({ id: docRef.id, ...data });
}
