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
    const { searchParams } = new URL(request.url);
    const commandId = searchParams.get("id");

    const commands = await botService.getCommands(discordId, botId);
    
    if (commandId) {
        const command = commands.find(c => c.id === commandId);
        return createApiResponse(command || null);
    }

    return createApiResponse(commands);
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

    const newCommand = await botService.addCommand(discordId, botId, data);
    return createApiResponse(newCommand);
  } catch (error) {
    return handleApiError(error);
  }
}
