"use client";

import { use } from "react";
import CommandsIndex from "./commands/page";

export default function BotPage({
  params: paramsPromise,
}: {
  params: Promise<{ botId: string }>;
}) {
  const params = use(paramsPromise);
  return <CommandsIndex params={params} />;
}
