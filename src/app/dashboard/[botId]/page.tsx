"use client";

import { use } from "react";
import CommandsIndex from "./commands/page";

export default function BotPage({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string }>;
}) {
  const params = use(paramsPromise);
  // By default, the bot page shows the commands index
  return <CommandsIndex params={params} />;
}