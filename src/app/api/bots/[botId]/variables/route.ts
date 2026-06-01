import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();

  const varsSnapshot = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("variables")
    .get();

  const variables = varsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json(variables, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();
  const data = await request.json();

  const docRef = await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .collection("variables")
    .add({ ...data, scope: 'global' }); // Default scope for now to fit the UI

  await db
    .collection("users")
    .doc(discordId)
    .collection("bots")
    .doc(botId)
    .update({
      variableCount: admin.firestore.FieldValue.increment(1)
    });

  return NextResponse.json({ id: docRef.id, ...data, scope: 'global' });
}
