import { db } from "@/lib/firebase";
import { Bot } from "@/lib/types/bot";
import * as admin from 'firebase-admin';
import { encrypt, decrypt } from "@/lib/crypto";

export const botService = {
  async listBots(discordId: string): Promise<Bot[]> {
    const botsSnapshot = await db
      .collection("users")
      .doc(discordId)
      .collection("bots")
      .get();

    return botsSnapshot.docs.map((botDoc) => {
      const data = botDoc.data();
      return {
        id: botDoc.id,
        name: data.name || "Unnamed Bot",
        commandCount: data.commandCount || 0,
        variableCount: data.variableCount || 0,
      };
    });
  },

  async createBot(discordId: string, name: string, token?: string): Promise<{ botId: string, botIdFromToken: string | null }> {
    let botIdFromToken = null;
    if (token) {
        try {
            const response = await fetch("https://discord.com/api/v10/users/@me", {
                headers: { Authorization: `Bot ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                botIdFromToken = data.id;
            }
        } catch(e) {
            console.error("Failed to fetch bot ID", e);
        }
    }

    const botRef = await db
      .collection("users")
      .doc(discordId)
      .collection("bots")
      .add({
        name,
        commandCount: 0,
        variableCount: 0,
      });

    const settings: any = { name };
    if (token) {
      settings.botToken = encrypt(token);
    }
    if (botIdFromToken) {
      settings.botId = botIdFromToken;
    }

    await botRef
      .collection("config")
      .doc("settings")
      .set(settings);

    return { botId: botRef.id, botIdFromToken };
  },

  async getCommands(discordId: string, botId: string) {
    const snapshot = await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("commands").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async addCommand(discordId: string, botId: string, data: any) {
    const docRef = await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("commands").add(data);
    await db.collection("users").doc(discordId).collection("bots").doc(botId).update({ commandCount: admin.firestore.FieldValue.increment(1) });
    return { id: docRef.id, ...data };
  },

  async updateCommand(discordId: string, botId: string, commandId: string, data: any) {
    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("commands").doc(commandId).set(data, { merge: true });
  },

  async deleteCommand(discordId: string, botId: string, commandId: string) {
    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("commands").doc(commandId).delete();
    await db.collection("users").doc(discordId).collection("bots").doc(botId).update({ commandCount: admin.firestore.FieldValue.increment(-1) });
  },

  async getVariables(discordId: string, botId: string) {
    const snapshot = await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("variables").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async addVariable(discordId: string, botId: string, data: any) {
    const docRef = await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("variables").add({ ...data, scope: 'global' });
    await db.collection("users").doc(discordId).collection("bots").doc(botId).update({ variableCount: admin.firestore.FieldValue.increment(1) });
    return { id: docRef.id, ...data, scope: 'global' };
  },

  async updateVariable(discordId: string, botId: string, variableId: string, data: any) {
    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("variables").doc(variableId).update(data);
  },

  async deleteVariable(discordId: string, botId: string, variableId: string) {
    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("variables").doc(variableId).delete();
    await db.collection("users").doc(discordId).collection("bots").doc(botId).update({ variableCount: admin.firestore.FieldValue.increment(-1) });
  },

  async getStatus(discordId: string, botId: string) {
    const doc = await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("config").doc("status").get();
    return doc.exists ? doc.data() : {};
  },

  async setStatus(discordId: string, botId: string, data: any) {
    const zbrConfig = {
        status: data.status,
        activity: {
          name: data.activityName,
          type: data.activityType,
        },
        logging: data.isLoggingEnabled,
      };
    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("config").doc("status").set(zbrConfig);
  },

  async getSettings(discordId: string, botId: string) {
    const doc = await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("config").doc("settings").get();
    if (!doc.exists) return {};
    const data = doc.data();
    if (data?.botToken) {
      data.botToken = decrypt(data.botToken);
    }
    return data;
  },

  async updateSettings(discordId: string, botId: string, data: any) {
    const settings: any = { ...data };
    let tokenError = false;
    if (settings.botToken) {
        const response = await fetch("https://discord.com/api/v10/users/@me", {
            headers: { Authorization: `Bot ${settings.botToken}` },
        });
        if (response.ok) {
            const botData = await response.json();
            settings.botId = botData.id;
        } else {
            tokenError = true;
        }
        settings.botToken = encrypt(settings.botToken);
    }
    await db.collection("users").doc(discordId).collection("bots").doc(botId).collection("config").doc("settings").set(settings, { merge: true });
    return { tokenError };
  },

  async deleteBot(discordId: string, botId: string) {
      const botRef = db.collection("users").doc(discordId).collection("bots").doc(botId);
      await db.recursiveDelete(botRef);
  }
};
