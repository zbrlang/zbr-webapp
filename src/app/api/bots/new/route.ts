import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { botService } from "@/lib/services/botService";
import { createApiResponse, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const discordId = await getDiscordId();
    const { name, token } = await request.json();

    const { botId, botIdFromToken } = await botService.createBot(discordId, name, token);
    
    return createApiResponse({ botId, error: botIdFromToken ? null : "Token invalid" });
  } catch (error) {
    return handleApiError(error);
  }
}
