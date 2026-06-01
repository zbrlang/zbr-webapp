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

    const settings = await botService.getSettings(discordId, botId);
    return createApiResponse(settings);
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

    const { tokenError } = await botService.updateSettings(discordId, botId, data);
    return createApiResponse({ success: true, tokenError });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const discordId = await getDiscordId();

    await botService.deleteBot(discordId, botId);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
