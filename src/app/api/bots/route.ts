import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { botService } from "@/lib/services/botService";
import { createApiResponse, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const discordId = await getDiscordId();
    const bots = await botService.listBots(discordId);
    
    return createApiResponse(bots, { 
      cacheControl: "private, no-cache, no-store, must-revalidate" 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
