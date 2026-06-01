import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { botService } from "@/lib/services/botService";
import { createApiResponse, handleApiError } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const discordId = await getDiscordId();

    const status = await botService.getStatus(discordId, botId);
    return createApiResponse(status);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const discordId = await getDiscordId();
    const data = await request.json();

    await botService.setStatus(discordId, botId, data);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
