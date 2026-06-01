import { z } from 'zod';

export const BotSchema = z.object({
  id: z.string(),
  name: z.string(),
  commandCount: z.number().default(0),
  variableCount: z.number().default(0),
});

export type Bot = z.infer<typeof BotSchema>;

export const CreateBotRequestSchema = z.object({
  name: z.string(),
  token: z.string().optional(),
});

export const CommandSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
});

export const VariableSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  value: z.string(),
  scope: z.string().default('global'),
});

export const StatusSchema = z.object({
  status: z.string(),
  activityName: z.string(),
  activityType: z.string(),
  isLoggingEnabled: z.boolean(),
});

export const SettingsSchema = z.object({
  name: z.string().optional(),
  botToken: z.string().optional(),
});
