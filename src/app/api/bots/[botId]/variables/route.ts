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

    const variables = await botService.getVariables(discordId, botId);

    return createApiResponse(variables);
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

    const newVariable = await botService.addVariable(discordId, botId, data);
    return createApiResponse(newVariable);
  } catch (error) {
    return handleApiError(error);
  }
}
