import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { botService } from "@/lib/services/botService";
import { createApiResponse, handleApiError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; variableId: string }> }
) {
  try {
    const { botId, variableId } = await params;
    const discordId = await getDiscordId();
    const data = await request.json();

    await botService.updateVariable(discordId, botId, variableId, data);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string; variableId: string }> }
) {
  try {
    const { botId, variableId } = await params;
    const discordId = await getDiscordId();

    await botService.deleteVariable(discordId, botId, variableId);
    return createApiResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
