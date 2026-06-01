import { NextRequest } from "next/server";
import * as admin from 'firebase-admin';
import { getDiscordId } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { createApiResponse, handleApiError } from "@/lib/api-response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const discordId = await getDiscordId();

    const botRef = db.collection("users").doc(discordId).collection("bots").doc(botId);
    
    // Delete subcollections (commands, variables, config)
    const subcollections = ['commands', 'variables', 'config'];
    for (const sub of subcollections) {
        const snapshot = await botRef.collection(sub).get();
        for (const doc of snapshot.docs) {
            await doc.ref.delete();
        }
    }

    await botRef.delete();

    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
