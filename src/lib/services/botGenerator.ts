import { db } from "@/lib/firebase";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { encrypt, decrypt } from "@/lib/crypto";

export async function generateBotProject(discordId: string, botId: string) {
  const botRef = db.collection("users").doc(discordId).collection("bots").doc(botId);

  // 1. Generate commands
  const commands = [];
  const commandsSnapshot = await botRef.collection("commands").get();
  for (const doc of commandsSnapshot.docs) {
    const cmd = doc.data();
    
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
    
    commands.push({ filename, content: fileContent });
  }

  // 2. Generate config
  const statusDoc = await botRef.collection("config").doc("status").get();
  const status = statusDoc.exists ? statusDoc.data() : {};
  const zbrJson = JSON.stringify(status, null, 2);

  // 3. Generate .env
  const settingsDoc = await botRef.collection("config").doc("settings").get();
  const settings = settingsDoc.exists ? settingsDoc.data() : {};
  const token = settings?.botToken ? decrypt(settings.botToken) : "";
  const envFile = `DISCORD_TOKEN=${token}
DATABASE_URL=sqlite:./zbr.db
BOT_ID=${settings?.botId || ""}
GUILD_ID=${settings?.guildId || ""}
`;

  // 4. Generate zbr.db
  const dbPath = path.join("/tmp", `zbr_${botId}_${Date.now()}.db`);
  const sqliteDb = new Database(dbPath);
  
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

  const varsSnapshot = await botRef.collection("variables").get();
  for (const doc of varsSnapshot.docs) {
    const v = doc.data();
    const scope = v.scope || 'global';
    
    if (scope === 'global') {
      sqliteDb.prepare(`INSERT INTO global_vars (bot_id, name, value) VALUES (?, ?, ?)`).run(botId, v.name, v.value);
    } else if (scope === 'server') {
      sqliteDb.prepare(`INSERT INTO server_vars (bot_id, guild_id, name, value) VALUES (?, ?, ?, ?)`).run(botId, v.guild_id || '', v.name, v.value);
    } else if (scope === 'user') {
      sqliteDb.prepare(`INSERT INTO user_vars (bot_id, guild_id, user_id, name, value) VALUES (?, ?, ?, ?, ?)`).run(botId, v.guild_id || '', v.user_id || '', v.name, v.value);
    } else if (scope === 'channel') {
      sqliteDb.prepare(`INSERT INTO channel_vars (bot_id, channel_id, name, value) VALUES (?, ?, ?, ?)`).run(botId, v.channel_id || '', v.name, v.value);
    }
  }
  
  sqliteDb.close();
  const dbBuffer = fs.readFileSync(dbPath);
  fs.unlinkSync(dbPath);
  const dbBase64 = dbBuffer.toString('base64');

  return { envFile, zbrJson, commands, dbBase64 };
}
