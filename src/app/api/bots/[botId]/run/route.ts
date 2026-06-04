import { NextRequest } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { generateBotProject } from "@/lib/services/botGenerator";
import { createApiResponse, handleApiError } from "@/lib/api-response";
import { db } from "@/lib/firebase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    const discordId = await getDiscordId();

    const projectData = await generateBotProject(discordId, botId);

    console.log("DiscordId:", discordId, "BotId:", botId);
    console.log("Generated project data:", JSON.stringify(projectData, null, 2));
    console.log("Full .env string:", projectData.envFile);
    console.log("Full zbr.json string:", projectData.zbrJson);
    projectData.commands.forEach((cmd, i) => console.log("Command [" + i + "] content:", cmd.content));


    const response = await fetch(`${process.env.ZBR_SERVER_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ZBR-Secret": process.env.ZBR_SECRET || ""
      },
      body: JSON.stringify({
        botId,
        discordId,
        ...projectData
      })
    });

    const responseBody = await response.json();
    console.log("ZBR server response status:", response.status);
    console.log("ZBR server response body:", responseBody);

    if (!response.ok) throw new Error("Failed to start bot");

    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("config").doc("status").set({ processStatus: "running" }, { merge: true });
    return createApiResponse({ success: true, status: "running" });
  } catch (error) {
    return handleApiError(error);
  }
}
