import { NextRequest, NextResponse } from "next/server";
import * as admin from 'firebase-admin';
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";
import AdmZip from "adm-zip";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const zip = new AdmZip(buffer);
  const zipEntries = zip.getEntries();

  const botRef = db.collection("users").doc(discordId).collection("bots").doc(botId);
  let importedCommandsCount = 0;
  let importedVarsCount = 0;

  for (const entry of zipEntries) {
    if (entry.entryName.startsWith("commands/") && entry.entryName.endsWith(".zbr")) {
      // ... (commands parsing)
      const content = entry.getData().toString("utf8");
      const lines = content.split("\n");
      const command: any = {};
      let bodyIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#")) {
          const [key, ...value] = lines[i].substring(1).split(" ");
          command[key] = value.join(" ");
        } else if (lines[i].trim() === "") {
          bodyIndex = i + 1;
          break;
        }
      }
      command.body = lines.slice(bodyIndex).join("\n");
      await botRef.collection("commands").add(command);
      importedCommandsCount++;
    } else if (entry.entryName === ".env") {
      // ... (.env parsing)
      const envContent = entry.getData().toString("utf8");
      const settings: any = {};
      envContent.split("\n").forEach(line => {
        const [key, value] = line.split("=");
        if (!key || !value) return;
        if (key === "DISCORD_TOKEN") settings.botToken = Buffer.from(value.trim()).toString('base64');
        if (key === "GUILD_ID") settings.guildId = value.trim();
        if (key === "BOT_ID") settings.botId = value.trim();
      });
      if (Object.keys(settings).length > 0) {
          await botRef.collection("config").doc("settings").set(settings, { merge: true });
      }
    } else if (entry.entryName === "zbr.json") {
      // ... (zbr.json parsing)
      const config = JSON.parse(entry.getData().toString("utf8"));
      await botRef.collection("config").doc("status").set(config, { merge: true });
    } else if (entry.entryName === "zbr.db") {
      const dbPath = path.join("/tmp", `import_${botId}.db`);
      fs.writeFileSync(dbPath, entry.getData());
      const sqliteDb = new Database(dbPath, { readonly: true });
      
      const tables = ["global_vars", "server_vars", "user_vars", "channel_vars"];
      for (const table of tables) {
        const scope = table.split("_")[0];
        const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all() as any[];
        
        for (const row of rows) {
          await botRef.collection("variables").add({
            scope,
            name: row.name,
            value: row.value,
            guild_id: row.guild_id || null,
            user_id: row.user_id || null,
            channel_id: row.channel_id || null
          });
          importedVarsCount++;
        }
      }
      sqliteDb.close();
      fs.unlinkSync(dbPath);
    }
  }

  await botRef.update({
    commandCount: admin.firestore.FieldValue.increment(importedCommandsCount),
    variableCount: admin.firestore.FieldValue.increment(importedVarsCount)
  });

  console.log(`Imported ${importedCommandsCount} commands and ${importedVarsCount} variables for bot ${botId}`);
  return NextResponse.json({ success: true, importedCommandsCount, importedVarsCount });
}
