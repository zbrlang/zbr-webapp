import { NextRequest, NextResponse } from "next/server";
import { getDiscordId } from "@/lib/auth";
import { generateBotProject } from "@/lib/services/botGenerator";
import AdmZip from "adm-zip";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();
  const zip = new AdmZip();

  const { envFile, zbrJson, commands, dbBase64 } = await generateBotProject(discordId, botId);

  // Add commands
  commands.forEach(cmd => {
    zip.addFile(`commands/${cmd.filename}`, Buffer.from(cmd.content, "utf8"));
  });

  // Add config
  zip.addFile("zbr.json", Buffer.from(zbrJson, "utf8"));
  zip.addFile(".env", Buffer.from(envFile, "utf8"));
  
  // Add DB
  zip.addFile("zbr.db", Buffer.from(dbBase64, 'base64'));

  const zipBuffer = zip.toBuffer();
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=zbr-export-${botId}.zip`,
    },
  });
}
