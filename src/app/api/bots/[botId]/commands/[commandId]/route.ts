import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { botService } from "@/lib/services/botService";
import { createApiResponse, handleApiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  try {
    const { botId, commandId } = await params;
    const discordId = await getDiscordId();
    const data = await request.json();

    await botService.updateCommand(discordId, botId, commandId, data);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  try {
    const { botId, commandId } = await params;
    const discordId = await getDiscordId();

    await botService.deleteCommand(discordId, botId, commandId);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
