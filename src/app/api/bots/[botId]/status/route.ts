import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

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
    .doc("status")
    .get();

  return NextResponse.json(doc.exists ? doc.data() : {}, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();
  const data = await request.json();

  // Map UI structure to required zbr.json structure
  const zbrConfig = {
    status: data.status,
    activity: {
      name: data.activityName,
      type: data.activityType,
    },
    logging: data.isLoggingEnabled,
  };

  await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("config")
    .doc("status")
    .set(zbrConfig);

  return NextResponse.json({ success: true });
}
