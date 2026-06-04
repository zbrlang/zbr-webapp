import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { botService } from "@/lib/services/botService";
import { createApiResponse, handleApiError } from "@/lib/api-response";
import { db } from "@/lib/firebase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const discordId = await getDiscordId();

    const response = await fetch(`${process.env.ZBR_SERVER_URL}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ZBR-Secret": process.env.ZBR_SECRET || ""
      },
      body: JSON.stringify({ botId, discordId })
    });

    if (!response.ok) throw new Error("Failed to stop bot");

    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("config").doc("status").set({ processStatus: "stopped" }, { merge: true });
    return createApiResponse({ success: true, status: "stopped" });
  } catch (error) {
    return handleApiError(error);
  }
}
