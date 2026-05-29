import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getDiscordId } from "@/lib/auth";
import AdmZip from "adm-zip";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;
  const discordId = await getDiscordId();
  const zip = new AdmZip();
  const botRef = db.collection("users").doc(discordId).collection("bots").doc(botId);

  // 1. Export commands
  const commandsSnapshot = await botRef.collection("commands").get();
  for (const doc of commandsSnapshot.docs) {
    const cmd = doc.data();
    
    // Explicit header construction in order
    let fileContent = `#trigger ${cmd.trigger}\n`;
    fileContent += `#name ${cmd.name}\n`;
    fileContent += `#type ${cmd.type}\n`;
    if (cmd.scope) fileContent += `#scope ${cmd.scope}\n`;
    if (cmd.description) fileContent += `#description ${cmd.description}\n`;
    
    if (cmd.options) {
        const options = JSON.parse(cmd.options);
        options.forEach((opt: any) => {
            fileContent += `#option ${opt.name}|${opt.description}|${opt.type}|${opt.required ? 'required' : 'optional'}\n`;
        });
    }
    
    fileContent += `\n${cmd.body}`;

    let filename = cmd.filename || cmd.name.toLowerCase().replace(/\s+/g, '-');
    if (!filename.endsWith('.zbr')) filename += '.zbr';
    
    zip.addFile(`commands/${filename}`, Buffer.from(fileContent, "utf8"));
  }

  // 2. Export config
  const statusDoc = await botRef.collection("config").doc("status").get();
  const status = statusDoc.exists ? statusDoc.data() : {};
  
  zip.addFile("zbr.json", Buffer.from(JSON.stringify(status, null, 2), "utf8"));

  // 3. Generate .env
  const settingsDoc = await botRef.collection("config").doc("settings").get();
  const settings = settingsDoc.exists ? settingsDoc.data() : {};
  console.log("Exporting - Bot ID from Firestore:", settings?.botId);
  
  // Decrypt token for export
  const decrypt = (text: string) => Buffer.from(text, 'base64').toString('ascii');
  const token = settings?.botToken ? decrypt(settings.botToken) : "";

  const envContent = `DISCORD_TOKEN=${token}
DATABASE_URL=sqlite:./zbr.db
BOT_ID=${settings?.botId || ""}
GUILD_ID=${settings?.guildId || ""}
`;
  zip.addFile(".env", Buffer.from(envContent, "utf8"));

  // 4. Generate zbr.db
  const dbPath = path.join("/tmp", `zbr_${botId}.db`);
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  const sqliteDb = new Database(dbPath);
  
  // Define tables
  const tables = [
    `CREATE TABLE IF NOT EXISTS global_vars (bot_id TEXT NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL DEFAULT '', PRIMARY KEY (bot_id, name));`,
    `CREATE TABLE IF NOT EXISTS server_vars (bot_id TEXT NOT NULL, guild_id TEXT NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL DEFAULT '', PRIMARY KEY (bot_id, guild_id, name));`,
    `CREATE TABLE IF NOT EXISTS user_vars (bot_id TEXT NOT NULL, guild_id TEXT NOT NULL, user_id TEXT NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL DEFAULT '', PRIMARY KEY (bot_id, guild_id, user_id, name));`,
    `CREATE TABLE IF NOT EXISTS channel_vars (bot_id TEXT NOT NULL, channel_id TEXT NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL DEFAULT '', PRIMARY KEY (bot_id, channel_id, name));`,
    `CREATE TABLE IF NOT EXISTS user_cooldowns (bot_id TEXT NOT NULL, guild_id TEXT NOT NULL, user_id TEXT NOT NULL, command TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (bot_id, guild_id, user_id, command));`,
    `CREATE TABLE IF NOT EXISTS server_cooldowns (bot_id TEXT NOT NULL, guild_id TEXT NOT NULL, command TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (bot_id, guild_id, command));`,
    `CREATE TABLE IF NOT EXISTS global_cooldowns (bot_id TEXT NOT NULL, user_id TEXT NOT NULL, command TEXT NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY (bot_id, user_id, command));`
  ];
  tables.forEach(t => sqliteDb.exec(t));

  // Export variables
  const varsSnapshot = await botRef.collection("variables").get();
  console.log(`Exporting ${varsSnapshot.size} variables for bot ${botId}`);
  for (const doc of varsSnapshot.docs) {
    const v = doc.data();
    const scope = v.scope || 'global';
    
    if (scope === 'global') {
      const stmt = sqliteDb.prepare(`INSERT INTO global_vars (bot_id, name, value) VALUES (?, ?, ?)`);
      stmt.run(botId, v.name, v.value);
    } else if (scope === 'server') {
      const stmt = sqliteDb.prepare(`INSERT INTO server_vars (bot_id, guild_id, name, value) VALUES (?, ?, ?, ?)`);
      stmt.run(botId, v.guild_id || '', v.name, v.value);
    } else if (scope === 'user') {
      const stmt = sqliteDb.prepare(`INSERT INTO user_vars (bot_id, guild_id, user_id, name, value) VALUES (?, ?, ?, ?, ?)`);
      stmt.run(botId, v.guild_id || '', v.user_id || '', v.name, v.value);
    } else if (scope === 'channel') {
      const stmt = sqliteDb.prepare(`INSERT INTO channel_vars (bot_id, channel_id, name, value) VALUES (?, ?, ?, ?)`);
      stmt.run(botId, v.channel_id || '', v.name, v.value);
    }
  }
  
  sqliteDb.close();
  zip.addLocalFile(dbPath, "", "zbr.db");

  const zipBuffer = zip.toBuffer();
  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=bot_${botId}_export.zip`,
    },
  });
}
